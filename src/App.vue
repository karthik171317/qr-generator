<template>
  <div class="container" style="padding:0px">
    <h1 style="margin:0px">QR Code Generator</h1>
    <div class="qr-generator">
      <div class="customization-panel">
        <div class="accordion">
          <!-- Basic Settings -->
          <div class="accordion-item">
            <div class="accordion-header" @click="toggleAccordion('basic')">
              <h3>Basic Settings</h3>
              <span class="accordion-icon">{{ isOpen.basic ? '▼' : '▶' }}</span>
            </div>
            <div class="accordion-content" :class="accordionContentClass('basic')">
              <div class="input-group">
                <label>Text or URL</label>
                <input
                  type="text"
                  v-model="text"
                  placeholder="Enter text or URL"
                  @input="debouncedGenerateQR"
                />
              </div>

              <div class="option-group">
                <label>Size</label>
                <div class="slider-container">
                  <input 
                    type="range" 
                    v-model="size" 
                    min="100" 
                    max="400" 
                    step="10"
                    @input="debouncedGenerateQR"
                  />
                  <span class="size-value">{{ size }}px</span>
                </div>
              </div>

              <div class="option-group">
                <label>Margin</label>
                <div class="slider-container">
                  <input 
                    type="range" 
                    v-model="margin" 
                    min="0" 
                    max="20" 
                    step="1"
                    @input="debouncedGenerateQR"
                  />
                  <span class="size-value">{{ margin }}px</span>
                </div>
              </div>

              <div class="option-group">
                <label>Error Correction</label>
                <select v-model="errorCorrection" @change="debouncedGenerateQR">
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Color Settings -->
          <div class="accordion-item">
            <div class="accordion-header" @click="toggleAccordion('color')">
              <h3>Color Settings</h3>
              <span class="accordion-icon">{{ isOpen.color ? '▼' : '▶' }}</span>
            </div>
            <div class="accordion-content" :class="accordionContentClass('color')">
              <div class="option-group">
                <label>QR Color</label>
                <div class="color-picker-container">
                  <input type="color" v-model="qrColor" @input="debouncedGenerateQR" />
                  <span class="color-value">{{ qrColor }}</span>
                </div>
              </div>

              <div class="option-group">
                <label>Background Color</label>
                <div class="color-picker-container">
                  <input type="color" v-model="backgroundColor" @input="debouncedGenerateQR" />
                  <span class="color-value">{{ backgroundColor }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Style Settings -->
          <div class="accordion-item">
            <div class="accordion-header" @click="toggleAccordion('style')">
              <h3>Style Settings</h3>
              <span class="accordion-icon">{{ isOpen.style ? '▼' : '▶' }}</span>
            </div>
            <div class="accordion-content" :class="accordionContentClass('style')">
              <div class="option-group">
                <label>Corner Radius</label>
                <div class="slider-container">
                  <input 
                    type="range" 
                    v-model="cornerRadius" 
                    min="0" 
                    max="20" 
                    step="1"
                    @input="debouncedGenerateQR"
                  />
                  <span class="size-value">{{ cornerRadius }}px</span>
                </div>
              </div>

              <div class="option-group">
                <label>Pattern Style</label>
                <select v-model="patternStyle" @change="debouncedGenerateQR">
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                  <option value="diamond">Diamond</option>
                </select>
              </div>

              <div class="option-group">
                <label>Eye Style</label>
                <select v-model="eyeStyle" @change="debouncedGenerateQR">
                  <option value="square">Square</option>
                  <option value="circle">Circle</option>
                  <option value="rounded">Rounded</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Logo Settings -->
          <div class="accordion-item">
            <div class="accordion-header" @click="toggleAccordion('logo')">
              <h3>Logo Settings</h3>
              <span class="accordion-icon">{{ isOpen.logo ? '▼' : '▶' }}</span>
            </div>
            <div class="accordion-content" :class="accordionContentClass('logo')">
              <div class="option-group">
                <label>Logo Overlay</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  @change="handleLogoUpload"
                  class="file-input"
                />
                <div v-if="logoUrl" class="logo-preview">
                  <img :src="logoUrl" alt="Logo Preview" />
                  <button @click="removeLogo" class="remove-logo">Remove Logo</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="qr-display">
        <div class="qr-code" v-show="qrCode">
          <div class="qr-container">
            <canvas ref="qrCanvas" class="qr-canvas" :width="size" :height="size"></canvas>
            <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="qr-logo" />
          </div>
        </div>
        <div class="download-container">
          <div class="dropdown" @click="toggleDropdown">
            <button class="download-btn">
              Download QR Code
              <span class="dropdown-icon">{{ isDropdownOpen ? '▲' : '▼' }}</span>
            </button>
            <div class="dropdown-content" v-show="isDropdownOpen">
              <button 
                v-for="format in downloadFormats" 
                :key="format.value"
                @click="downloadQR(format.value)"
                class="dropdown-item"
                :class="format.value"
              >
                {{ format.label }}
              </button>
            </div>
          </div>
        </div>
        <div class="placeholder" v-show="!qrCode">
          <div class="placeholder-content">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <p>Your QR code will appear here</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import QRCode from 'qrcode'
import { toCanvas } from 'qrcode'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'

const text = ref('')
const qrCode = ref('')
const size = ref(200)
const margin = ref(4)
const errorCorrection = ref('M')
const qrColor = ref('#000000')
const backgroundColor = ref('#FFFFFF')
const cornerRadius = ref(0)
const patternStyle = ref('square')
const eyeStyle = ref('square')
const logoUrl = ref('')
const qrCanvas = ref(null)
const isDropdownOpen = ref(false)
let timeoutId = null

// Add accordion state management
const isOpen = ref({
  basic: true,
  color: true,
  style: true,
  logo: true,
  frame: true
})

const toggleAccordion = (section) => {
  isOpen.value[section] = !isOpen.value[section]
}

const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logoUrl.value = e.target.result
      debouncedGenerateQR()
    }
    reader.readAsDataURL(file)
  }
}

const removeLogo = () => {
  logoUrl.value = ''
  debouncedGenerateQR()
}

const drawQRCode = async () => {
  console.log('Starting QR code generation...')
  
  // Wait for next tick to ensure canvas is mounted
  await nextTick()
  
  if (!qrCanvas.value) {
    console.log('Canvas not found, retrying...')
    return
  }

  if (!text.value) {
    console.log('No text provided')
    return
  }

  const canvas = qrCanvas.value
  console.log('Canvas element:', canvas)
  
  if (!canvas) {
    console.error('Canvas element is null')
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    console.error('Could not get canvas context')
    return
  }
  
  console.log('Canvas context obtained')
  
  // Set canvas size
  canvas.width = size.value
  canvas.height = size.value
  
  // Clear canvas
  ctx.fillStyle = backgroundColor.value
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  try {
    console.log('Generating QR code with params:', {
      text: text.value,
      errorCorrection: errorCorrection.value,
      margin: margin.value,
      size: size.value
    })

    // Generate QR code directly on the canvas
    await QRCode.toCanvas(canvas, text.value, {
      version: 0,
      errorCorrectionLevel: errorCorrection.value,
      margin: margin.value,
      width: size.value,
      color: {
        dark: qrColor.value,
        light: backgroundColor.value
      }
    })

    console.log('Base QR code generated')

    // Get image data for pattern styling
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // Calculate module size based on QR code version and size
    const qrVersion = Math.ceil(Math.sqrt(text.value.length)) + 2 * margin.value
    const moduleSize = Math.floor(size.value / qrVersion)
    console.log('Module size:', moduleSize)

    // Create a temporary canvas for pattern detection
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvas.width
    tempCanvas.height = canvas.height
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.drawImage(canvas, 0, 0)

    // Apply pattern style
    if (patternStyle.value !== 'square') {
      console.log('Applying pattern style:', patternStyle.value)
      ctx.fillStyle = backgroundColor.value
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw patterns for each module
      for (let y = 0; y < canvas.height; y += moduleSize) {
        for (let x = 0; x < canvas.width; x += moduleSize) {
          // Check if this is a dark module
          const moduleData = tempCtx.getImageData(x + moduleSize/2, y + moduleSize/2, 1, 1).data
          if (moduleData[0] === 0 && moduleData[1] === 0 && moduleData[2] === 0) {
            ctx.beginPath()
            if (patternStyle.value === 'circle') {
              ctx.arc(x + moduleSize/2, y + moduleSize/2, moduleSize/2 - 1, 0, Math.PI * 2)
            } else if (patternStyle.value === 'diamond') {
              ctx.moveTo(x + moduleSize/2, y)
              ctx.lineTo(x + moduleSize, y + moduleSize/2)
              ctx.lineTo(x + moduleSize/2, y + moduleSize)
              ctx.lineTo(x, y + moduleSize/2)
              ctx.closePath()
            }
            ctx.fillStyle = qrColor.value
            ctx.fill()
          }
        }
      }
    }

    // Apply eye style
    if (eyeStyle.value !== 'square') {
      console.log('Applying eye style:', eyeStyle.value)
      const eyeSize = moduleSize * 7
      const eyeMargin = margin.value * moduleSize
      const positions = [
        { x: eyeMargin + eyeSize/2, y: eyeMargin + eyeSize/2 },
        { x: canvas.width - eyeMargin - eyeSize/2, y: eyeMargin + eyeSize/2 },
        { x: eyeMargin + eyeSize/2, y: canvas.height - eyeMargin - eyeSize/2 }
      ]

      positions.forEach(pos => {
        // Clear the eye area
        ctx.fillStyle = backgroundColor.value
        ctx.fillRect(pos.x - eyeSize/2, pos.y - eyeSize/2, eyeSize, eyeSize)

        if (eyeStyle.value === 'circle') {
          // Draw outer circle
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, eyeSize/2, 0, Math.PI * 2)
          ctx.fillStyle = qrColor.value
          ctx.fill()

          // Draw middle circle
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, eyeSize/3, 0, Math.PI * 2)
          ctx.fillStyle = backgroundColor.value
          ctx.fill()

          // Draw inner circle
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, eyeSize/6, 0, Math.PI * 2)
          ctx.fillStyle = qrColor.value
          ctx.fill()
        } else if (eyeStyle.value === 'rounded') {
          // Draw outer rounded square
          const outerRadius = eyeSize/4
          ctx.beginPath()
          ctx.moveTo(pos.x - eyeSize/2 + outerRadius, pos.y - eyeSize/2)
          ctx.lineTo(pos.x + eyeSize/2 - outerRadius, pos.y - eyeSize/2)
          ctx.quadraticCurveTo(pos.x + eyeSize/2, pos.y - eyeSize/2, pos.x + eyeSize/2, pos.y - eyeSize/2 + outerRadius)
          ctx.lineTo(pos.x + eyeSize/2, pos.y + eyeSize/2 - outerRadius)
          ctx.quadraticCurveTo(pos.x + eyeSize/2, pos.y + eyeSize/2, pos.x + eyeSize/2 - outerRadius, pos.y + eyeSize/2)
          ctx.lineTo(pos.x - eyeSize/2 + outerRadius, pos.y + eyeSize/2)
          ctx.quadraticCurveTo(pos.x - eyeSize/2, pos.y + eyeSize/2, pos.x - eyeSize/2, pos.y + eyeSize/2 - outerRadius)
          ctx.lineTo(pos.x - eyeSize/2, pos.y - eyeSize/2 + outerRadius)
          ctx.quadraticCurveTo(pos.x - eyeSize/2, pos.y - eyeSize/2, pos.x - eyeSize/2 + outerRadius, pos.y - eyeSize/2)
          ctx.fillStyle = qrColor.value
          ctx.fill()

          // Draw middle rounded square
          const middleSize = eyeSize/3
          const middleRadius = middleSize/4
          ctx.beginPath()
          ctx.moveTo(pos.x - middleSize/2 + middleRadius, pos.y - middleSize/2)
          ctx.lineTo(pos.x + middleSize/2 - middleRadius, pos.y - middleSize/2)
          ctx.quadraticCurveTo(pos.x + middleSize/2, pos.y - middleSize/2, pos.x + middleSize/2, pos.y - middleSize/2 + middleRadius)
          ctx.lineTo(pos.x + middleSize/2, pos.y + middleSize/2 - middleRadius)
          ctx.quadraticCurveTo(pos.x + middleSize/2, pos.y + middleSize/2, pos.x + middleSize/2 - middleRadius, pos.y + middleSize/2)
          ctx.lineTo(pos.x - middleSize/2 + middleRadius, pos.y + middleSize/2)
          ctx.quadraticCurveTo(pos.x - middleSize/2, pos.y + middleSize/2, pos.x - middleSize/2, pos.y + middleSize/2 - middleRadius)
          ctx.lineTo(pos.x - middleSize/2, pos.y - middleSize/2 + middleRadius)
          ctx.quadraticCurveTo(pos.x - middleSize/2, pos.y - middleSize/2, pos.x - middleSize/2 + middleRadius, pos.y - middleSize/2)
          ctx.fillStyle = backgroundColor.value
          ctx.fill()

          // Draw inner square
          const innerSize = eyeSize/6
          ctx.beginPath()
          ctx.rect(pos.x - innerSize/2, pos.y - innerSize/2, innerSize, innerSize)
          ctx.fillStyle = qrColor.value
          ctx.fill()
        }
      })
    }

    // Add logo if present
    if (logoUrl.value) {
      console.log('Adding logo')
      const logoImg = new Image()
      logoImg.src = logoUrl.value
      await new Promise((resolve) => {
        logoImg.onload = () => {
          const logoSize = size.value * 0.2
          const x = (size.value - logoSize) / 2
          const y = (size.value - logoSize) / 2
          
          // Draw white background for logo
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10)
          
          // Draw logo
          ctx.drawImage(logoImg, x, y, logoSize, logoSize)
          resolve()
        }
      })
    }

    // Convert canvas to data URL
    qrCode.value = canvas.toDataURL('image/png')
    console.log('QR code generation completed')
  } catch (err) {
    console.error('Error generating QR code:', err)
  }
}

const generateQR = async () => {
  if (!text.value) {
    qrCode.value = ''
    return
  }
  
  await drawQRCode()
}

const debouncedGenerateQR = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  
  timeoutId = setTimeout(() => {
    generateQR()
  }, 500)
}

const downloadFormats = [
  { label: 'PNG', value: 'png' },
  { label: 'SVG', value: 'svg' },
  { label: 'PDF', value: 'pdf' },
  { label: 'EPS', value: 'eps' }
]

const downloadQR = async (format) => {
  if (!qrCode.value) return

  try {
    switch (format) {
      case 'png':
        await downloadPNG()
        break
      case 'svg':
        await downloadSVG()
        break
      case 'pdf':
        await downloadPDF()
        break
      case 'eps':
        await downloadEPS()
        break
    }
  } catch (error) {
    console.error('Error downloading QR code:', error)
  }
}

const downloadPNG = async () => {
  const link = document.createElement('a')
  link.href = qrCode.value
  link.download = 'qr-code.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const downloadSVG = async () => {
  const canvas = qrCanvas.value
  const svg = await QRCode.toString(text.value, {
    type: 'svg',
    margin: margin.value,
    width: size.value,
    color: {
      dark: qrColor.value,
      light: backgroundColor.value
    }
  })
  
  const blob = new Blob([svg], { type: 'image/svg+xml' })
  saveAs(blob, 'qr-code.svg')
}

const downloadPDF = async () => {
  const canvas = qrCanvas.value
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [size.value, size.value]
  })
  
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, size.value, size.value)
  pdf.save('qr-code.pdf')
}

const downloadEPS = async () => {
  const canvas = qrCanvas.value
  const dataUrl = canvas.toDataURL('image/png')
  
  // Convert PNG to EPS using a canvas
  const img = new Image()
  img.src = dataUrl
  
  await new Promise((resolve) => {
    img.onload = () => {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = size.value
      tempCanvas.height = size.value
      const ctx = tempCanvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      
      // Create EPS content
      const epsContent = `%!PS-Adobe-3.0 EPSF-3.0
%%BoundingBox: 0 0 ${size.value} ${size.value}
%%EndComments
gsave
0 0 ${size.value} ${size.value} rectclip
${size.value} 0 translate
90 rotate
${size.value} 0 translate
-90 rotate
${dataUrl} 0 0 ${size.value} ${size.value} rectclip
grestore
showpage`
      
      const blob = new Blob([epsContent], { type: 'application/postscript' })
      saveAs(blob, 'qr-code.eps')
      resolve()
    }
  })
}

// Watch for canvas changes
watch(qrCanvas, (newCanvas) => {
  if (newCanvas) {
    console.log('Canvas mounted:', newCanvas)
    generateQR()
  }
})

// Initialize with a default value
onMounted(async () => {
  text.value = 'Hello World' // Add a default value
  await nextTick() // Wait for DOM to be updated
  if (qrCanvas.value) {
    generateQR()
  } else {
    console.log('Canvas not available on mount, waiting for watch...')
  }
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})

// Add a computed property for accordion content classes
const accordionContentClass = (section) => {
  return {
    'accordion-content': true,
    'collapsed': !isOpen.value[section]
  }
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown')) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #1e293b;
  font-size: 3rem;
  font-weight: 700;
  letter-spacing: -0.025em;
}

.qr-generator {
  display: flex;
  gap: 3rem;
  width: 100%;
  margin: 0 auto;
  min-height: 600px;
  position: relative;
}

.customization-panel {
  width: 400px;
  flex-shrink: 0;
  overflow-y: auto;
  padding-right: 1rem;
  max-height: 700px;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 1.5rem;
  background-color: #f8fafc;
}

.qr-display {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: calc(100% - 400px - 3rem);
  position: relative;
  gap: 2rem;
}

.qr-code {
  width: 500px;
  height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
}

.qr-container {
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-canvas {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
  transition: all 0.3s ease;
}

.placeholder {
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 0.5rem;
}

.placeholder-content {
  text-align: center;
  color: #64748b;
}

.placeholder-content svg {
  margin-bottom: 1rem;
}

.placeholder-content p {
  margin: 0;
  font-size: 1rem;
}

/* Accordion styles */
.accordion {
  width: 100%;
}

.accordion-item {
  margin-bottom: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: white;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8fafc;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.accordion-header:hover {
  background-color: #f1f5f9;
}

.accordion-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e293b;
}

.accordion-icon {
  font-size: 0.8rem;
  color: #64748b;
  transition: transform 0.3s ease;
}

.accordion-content {
  padding: 1rem;
  background-color: white;
  max-height: 1000px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.accordion-content.collapsed {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.accordion-content .option-group {
  margin-bottom: 1rem;
  transition: opacity 0.3s ease;
}

.accordion-content.collapsed .option-group {
  opacity: 0;
}

.accordion-content .option-group:last-child {
  margin-bottom: 0;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .container {
    padding: 1.5rem;
  }

  .qr-generator {
    gap: 2rem;
  }

  .customization-panel {
    width: 350px;
  }

  .qr-display {
    width: calc(100% - 350px - 2rem);
  }

  .qr-code {
    width: 400px;
    height: 400px;
  }

  h1 {
    font-size: 2.75rem;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .qr-generator {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .customization-panel {
    width: 100%;
    max-width: 500px;
    margin-bottom: 1rem;
  }

  .qr-display {
    width: 100%;
    max-width: 500px;
    gap: 1.5rem;
  }

  .qr-code {
    width: 100%;
    height: auto;
    aspect-ratio: 1;
    max-width: 400px;
  }

  h1 {
    font-size: 2.25rem;
    margin-bottom: 1.5rem;
  }

  .accordion-header h3 {
    font-size: 1.1rem;
  }

  .option-group label {
    font-size: 1rem;
  }

  .option-group select {
    font-size: 1rem;
  }

  .size-value {
    font-size: 1rem;
  }

  .color-value {
    font-size: 1rem;
  }

  .download-btn {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
  }

  .dropdown-item {
    font-size: 1rem;
    padding: 0.875rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0.75rem;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .qr-code {
    max-width: 300px;
  }

  .customization-panel {
    padding: 1rem;
  }

  .accordion-header {
    padding: 0.75rem;
  }

  .accordion-content {
    padding: 0.75rem;
  }

  .slider-container {
    gap: 0.75rem;
  }

  .color-picker-container {
    gap: 0.75rem;
  }

  .color-picker-container input[type="color"] {
    width: 32px;
    height: 32px;
  }

  .download-btn {
    min-width: 180px;
  }
}

.download-container {
  margin-top: 0;
  position: relative;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.download-btn {
  padding: 1rem 2rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  font-weight: 500;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.download-btn:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
}

.dropdown-icon {
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.dropdown-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 0.5rem;
  z-index: 10;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #1e293b;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.dropdown-item:hover {
  background-color: #f8fafc;
}

.dropdown-item.png::before {
  content: '';
  width: 16px;
  height: 16px;
  background-color: #3b82f6;
  border-radius: 2px;
}

.dropdown-item.svg::before {
  content: '';
  width: 16px;
  height: 16px;
  background-color: #10b981;
  border-radius: 2px;
}

.dropdown-item.pdf::before {
  content: '';
  width: 16px;
  height: 16px;
  background-color: #ef4444;
  border-radius: 2px;
}

.dropdown-item.eps::before {
  content: '';
  width: 16px;
  height: 16px;
  background-color: #8b5cf6;
  border-radius: 2px;
}

/* Add smooth transitions for all size changes */
.option-group input[type="range"] {
  transition: all 0.3s ease;
}

.option-group select {
  transition: all 0.3s ease;
}

/* Ensure smooth transitions for QR code size changes */
.qr-container {
  will-change: transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Add a loading state for smoother transitions */
.qr-code.loading {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

/* Add a wrapper for the QR code to maintain aspect ratio */
.qr-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  transition: all 0.3s ease;
}

.qr-wrapper canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.option-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.option-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  background-color: white;
  font-size: 1.1rem;
  color: #1e293b;
  transition: all 0.2s ease;
}

.option-group select:hover {
  border-color: #cbd5e1;
}

.option-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.slider-container input[type="range"] {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  background: #e2e8f0;
  border-radius: 3px;
  outline: none;
}

.slider-container input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider-container input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.size-value {
  min-width: 50px;
  text-align: right;
  font-size: 1.1rem;
  color: #64748b;
}

.color-picker-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.color-picker-container input[type="color"] {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.color-value {
  font-size: 1.1rem;
  color: #64748b;
}
</style> 