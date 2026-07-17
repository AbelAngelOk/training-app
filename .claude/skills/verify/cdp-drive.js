// Minimal CDP driver using Node's built-in WebSocket (Node 22+), zero deps.
// Usage: node cdp-drive.js <script.json-lines-of-steps>
// Steps supported: navigate(url), fillInput(selector, value), click(selector),
// sleep(ms), screenshot(path), getText() -> logs body innerText

const fs = require('fs')
const path = require('path')

const CDP_PORT = process.env.CDP_PORT || 9333

async function getWsUrl() {
  const res = await fetch(`http://localhost:${CDP_PORT}/json/new?about:blank`, { method: 'PUT' })
  const tab = await res.json()
  return tab.webSocketDebuggerUrl
}

function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl)
    ws.addEventListener('open', () => resolve(ws))
    ws.addEventListener('error', reject)
  })
}

function send(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = Math.floor(Math.random() * 1e9)
    const handler = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id === id) {
        ws.removeEventListener('message', handler)
        if (msg.error) reject(new Error(JSON.stringify(msg.error)))
        else resolve(msg.result)
      }
    }
    ws.addEventListener('message', handler)
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function evaluate(ws, expression) {
  const result = await send(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  })
  if (result.exceptionDetails) {
    throw new Error('Evaluate error: ' + JSON.stringify(result.exceptionDetails))
  }
  return result.result.value
}

async function main() {
  const wsUrl = await getWsUrl()
  const ws = await connect(wsUrl)
  await send(ws, 'Page.enable')
  await send(ws, 'Runtime.enable')

  const [, , scriptPath] = process.argv
  const steps = JSON.parse(fs.readFileSync(scriptPath, 'utf8'))

  for (const step of steps) {
    if (step.op === 'navigate') {
      await send(ws, 'Page.navigate', { url: step.url })
      await new Promise((r) => setTimeout(r, step.wait ?? 2500))
    } else if (step.op === 'fill') {
      // Native-setter trick so React's controlled-input onChange fires.
      const expr = `
        (function() {
          const el = document.querySelector(${JSON.stringify(step.selector)});
          if (!el) return 'NOT_FOUND';
          const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
          const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
          setter.call(el, ${JSON.stringify(step.value)});
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return 'OK';
        })()
      `
      const r = await evaluate(ws, expr)
      console.log('fill', step.selector, '->', r)
    } else if (step.op === 'click') {
      const expr = `
        (function() {
          const el = document.querySelector(${JSON.stringify(step.selector)});
          if (!el) return 'NOT_FOUND';
          el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
          return 'OK';
        })()
      `
      const r = await evaluate(ws, expr)
      console.log('click', step.selector, '->', r)
    } else if (step.op === 'clickText') {
      const expr = `
        (function() {
          const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let node;
          while ((node = walker.nextNode())) {
            if (node.textContent.trim() === ${JSON.stringify(step.text)}) {
              let el = node.parentElement;
              for (let i = 0; i < 6 && el; i++, el = el.parentElement) {
                if (el.onclick || el.getAttribute('role') === 'button' || getComputedStyle(el).cursor === 'pointer') {
                  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
                  return 'CLICKED:' + el.tagName;
                }
              }
              node.parentElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
              return 'CLICKED_PARENT_FALLBACK';
            }
          }
          return 'TEXT_NOT_FOUND';
        })()
      `
      const r = await evaluate(ws, expr)
      console.log('clickText', step.text, '->', r)
    } else if (step.op === 'sleep') {
      await new Promise((r) => setTimeout(r, step.ms))
    } else if (step.op === 'screenshot') {
      const { data } = await send(ws, 'Page.captureScreenshot', { format: 'png' })
      fs.writeFileSync(step.path, Buffer.from(data, 'base64'))
      console.log('screenshot saved:', step.path)
    } else if (step.op === 'text') {
      const t = await evaluate(ws, 'document.body.innerText')
      console.log('BODY_TEXT_START')
      console.log(t)
      console.log('BODY_TEXT_END')
    } else if (step.op === 'url') {
      const u = await evaluate(ws, 'window.location.href')
      console.log('URL:', u)
    } else if (step.op === 'eval') {
      const r = await evaluate(ws, step.expr)
      console.log('eval ->', JSON.stringify(r))
    }
  }

  await send(ws, 'Target.closeTarget', {}).catch(() => {})
  ws.close()
}

main().catch((err) => {
  console.error('DRIVER_ERROR', err)
  process.exit(1)
})
