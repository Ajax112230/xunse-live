/**
 * 可配置 WebGL 星空/银河背景
 * 从 traditional-color 完整版提取，18 个可配置参数
 * 零依赖，纯 WebGL
 *
 * 使用方式：
 *   const galaxy = initGalaxy(document.body, {
 *     hueShift: 0.15,
 *     density: 1.0,
 *     glowIntensity: 1.2,
 *     mouseRepulsion: true,
 *   });
 *   // 销毁: galaxy.destroy();
 */

const GalaxyDefaults = {
  starCount: 180,
  hueShift: 0.0,
  density: 1.0,
  glowIntensity: 1.0,
  saturation: 1.0,
  twinkleSpeed: 1.0,
  twinkleIntensity: 1.0,
  rotationSpeed: 0.15,
  mouseRepulsion: false,
  repulsionStrength: 0.5,
  centerRepulsion: false,
  centerStrength: 0.3,
  starSize: 1.0,
  flareIntensity: 0.6,
  nebulaIntensity: 0.4,
  brightness: 1.0,
  layerCount: 4.0,
  blendMode: 'screen',
};

const VERTEX_SHADER = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uHueShift;
uniform float uDensity;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform float uTwinkleIntensity;
uniform float uTwinkleSpeed;
uniform float uRotationSpeed;
uniform float uMouseRepulsion;
uniform float uRepulsionStrength;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform float uStarSize;
uniform float uFlareIntensity;
uniform float uNebulaIntensity;
uniform float uBrightness;
uniform float uLayerCount;
uniform float uCenterRepulsion;
uniform float uCenterStrength;

#define NUM_LAYER 4.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) - 0.5) * 2.0;
}

float trisn(float x) {
  return tri(x) * 2.0 - 1.0;
}

vec4 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return vec4(c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y), 1.0);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = 0.01 / d;
  float rays = max(0.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * (0.3 + 0.7 * (1.0 - d));
  m += smoothstep(0.01, 0.0, d) * 0.3;
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);
  for (float i = 0.0; i < NUM_LAYER; i++) {
    float depth = fract(i + uTime * 0.02 * uRotationSpeed);
    float scale = mix(20.0, 0.5, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    vec2 st = uv * scale;
    vec2 id = floor(st);
    vec2 gv = fract(st) - 0.5;
    for (float y = -1.0; y <= 1.0; y++) {
      for (float x = -1.0; x <= 1.0; x++) {
        vec2 offset = vec2(x, y);
        vec2 cellId = id + offset;
        float n = Hash21(cellId);
        if (n > 0.02 / uDensity) continue;
        vec2 pos = vec2(
          trisn(n * 345.32 + uTime * 0.005),
          trisn(n * 789.12 + uTime * 0.005)
        ) * 0.6;
        vec2 starUv = gv - offset - pos;
        float size = fract(n * 345.32) * uStarSize;
        float star = Star(starUv * (2.0 - size * 0.8), uFlareIntensity);
        float twinkle = 1.0;
        if (uTwinkleIntensity > 0.01) {
          twinkle = 0.6 + 0.4 * sin(uTime * uTwinkleSpeed * (1.0 + n * 3.0) + n * 100.0);
          twinkle = mix(1.0, twinkle, uTwinkleIntensity);
        }
        float hue = n + uHueShift + depth * 0.1;
        hue = fract(hue);
        vec4 starCol = hsv2rgb(vec3(hue, uSaturation * 0.5, 1.0));
        col += starCol.rgb * star * fade * twinkle * uGlowIntensity * uBrightness;
        col += starCol.rgb * star * fade * twinkle * uNebulaIntensity * 0.03 * uBrightness;
      }
    }
  }
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

  // 鼠标排斥
  if (uMouseActive > 0.5 && uMouseRepulsion > 0.01) {
    vec2 mouseUv = (uMouse - 0.5 * uResolution.xy) / uResolution.y;
    float dist = length(uv - mouseUv);
    float strength = uRepulsionStrength * smoothstep(0.3, 0.0, dist);
    uv += normalize(uv - mouseUv) * strength * 0.05;
  }

  // 中心排斥
  if (uCenterRepulsion > 0.01) {
    float cdist = length(uv);
    uv += normalize(uv) * uCenterStrength * smoothstep(0.5, 0.0, cdist) * 0.05;
  }

  vec3 col = StarLayer(uv);

  // 柔和暗角
  float vignette = 1.0 - length(uv) * 0.4;
  col *= vignette;

  gl_FragColor = vec4(col, 1.0);
}`;

/**
 * 初始化星空背景
 * @param {HTMLElement} container - 容器元素
 * @param {Object} [opts] - 配置选项 (覆盖 GalaxyDefaults)
 * @returns {{ destroy: Function, canvas: HTMLCanvasElement }}
 */
function initGalaxy(container, opts = {}) {
  const options = Object.assign({}, GalaxyDefaults, opts);

  // 创建 Canvas
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  container.style.position = container.style.position || 'relative';
  container.insertBefore(canvas, container.firstChild);

  // WebGL 上下文
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('WebGL not supported, galaxy background disabled');
    return { destroy() { canvas.remove(); }, canvas };
  }

  // 着色器编译
  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Shader error:', gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl.VERTEX_SHADER, VERTEX_SHADER));
  gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
  gl.linkProgram(program);
  gl.useProgram(program);

  // 全屏三角形
  const verts = new Float32Array([-1, -1, 3, -1, -1, 3]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Uniform locations
  const uniforms = {};
  [
    'uResolution', 'uTime', 'uHueShift', 'uDensity', 'uGlowIntensity',
    'uSaturation', 'uTwinkleIntensity', 'uTwinkleSpeed', 'uRotationSpeed',
    'uMouseRepulsion', 'uRepulsionStrength', 'uMouse', 'uMouseActive',
    'uStarSize', 'uFlareIntensity', 'uNebulaIntensity', 'uBrightness',
    'uLayerCount', 'uCenterRepulsion', 'uCenterStrength',
  ].forEach(name => {
    uniforms[name] = gl.getUniformLocation(program, name);
  });

  // 鼠标追踪
  let mouseX = -999, mouseY = -999, mouseActive = 0;
  function onMouse(e) {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * devicePixelRatio;
    mouseY = (e.clientY - rect.top) * devicePixelRatio;
    mouseActive = 1;
  }
  function onLeave() { mouseActive = 0; }
  canvas.addEventListener('mousemove', onMouse);
  canvas.addEventListener('mouseleave', onLeave);

  // 响应式
  function resize() {
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  // 动画循环
  let animId, startTime = performance.now();
  function loop(now) {
    animId = requestAnimationFrame(loop);
    resize();

    const t = (now - startTime) / 1000;
    const dpr = window.devicePixelRatio || 1;

    gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.uTime, t);
    gl.uniform1f(uniforms.uHueShift, options.hueShift);
    gl.uniform1f(uniforms.uDensity, options.density);
    gl.uniform1f(uniforms.uGlowIntensity, options.glowIntensity);
    gl.uniform1f(uniforms.uSaturation, options.saturation);
    gl.uniform1f(uniforms.uTwinkleIntensity, options.twinkleIntensity);
    gl.uniform1f(uniforms.uTwinkleSpeed, options.twinkleSpeed);
    gl.uniform1f(uniforms.uRotationSpeed, options.rotationSpeed);
    gl.uniform1f(uniforms.uMouseRepulsion, options.mouseRepulsion ? 1.0 : 0.0);
    gl.uniform1f(uniforms.uRepulsionStrength, options.repulsionStrength);
    gl.uniform2f(uniforms.uMouse, mouseX * dpr, mouseY * dpr);
    gl.uniform1f(uniforms.uMouseActive, mouseActive);
    gl.uniform1f(uniforms.uStarSize, options.starSize);
    gl.uniform1f(uniforms.uFlareIntensity, options.flareIntensity);
    gl.uniform1f(uniforms.uNebulaIntensity, options.nebulaIntensity);
    gl.uniform1f(uniforms.uBrightness, options.brightness);
    gl.uniform1f(uniforms.uLayerCount, options.layerCount);
    gl.uniform1f(uniforms.uCenterRepulsion, options.centerRepulsion ? 1.0 : 0.0);
    gl.uniform1f(uniforms.uCenterStrength, options.centerStrength);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  animId = requestAnimationFrame(loop);

  return {
    canvas,
    destroy() {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mouseleave', onLeave);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    },
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initGalaxy, GalaxyDefaults };
}
