import { ICONS } from './ios-weather-icons.js';
import { CONDITION_MAP, LABEL_MAP, VISUAL_CONFIG, QWEATHER_ICON_MAP } from './ios-weather-const.js';
import { styles } from './ios-weather-style.js';
import { weatherIcons } from './weatherIcons.js';
import './ios-weather-editor.js';

console.info("%c iOS 18 Weather Card %c v1.0 ", "color: white; background: #007aff; font-weight: 700;", "color: #007aff; background: white; font-weight: 700;");

class IOSWeatherCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._forecastData = [];
        this._isFetchingForecast = false;
        this._lastFetch = 0;
    }

    static getConfigElement() { return document.createElement("ios-weather-card-editor"); }
    static getStubConfig(hass, entities, entitiesFallback) {
        let defaultEntity = "weather.home";

        // 尝试?HA 传入的实体列表中，寻找第一个以 weather. 开头的实体
        if (entities && entities.length) {
            const found = entities.find(e => e.startsWith("weather."));
            if (found) defaultEntity = found;
        }

        return {
            entity: defaultEntity,
            show_current: true,
            show_forecast: true,
            forecast_rows: 5,
            forecast_type: 'daily'
        };
    }
    set hass(hass) {
        if (!this._config) return;
        const config = this._config;
        const entityId = config.entity;
        if (!entityId) { this._renderEmpty("请选择实体"); return; }

        const stateObj = hass.states[entityId];
        if (!stateObj) { this._renderEmpty(`未找到实? ${entityId}`); return; }

        const rawState = stateObj.state;
        const skycon = stateObj.attributes.skycon || stateObj.attributes.caiyun_skycon;
        const conditionCn = stateObj.attributes.condition_cn;
        const qweatherIcon = stateObj.attributes.qweather_icon;

        let standardKey = 'cloudy';
        let displayLabel = null;

        // 1. HeFeng Weather (QWeather) Detection
        if (conditionCn && qweatherIcon) {
            displayLabel = conditionCn;
            if (QWEATHER_ICON_MAP[qweatherIcon]) {
                standardKey = QWEATHER_ICON_MAP[qweatherIcon];
            }
        }
        // 2. Caiyun Weather Detection
        else if (skycon) {
            if (CONDITION_MAP[skycon]) standardKey = CONDITION_MAP[skycon];
            else {
                const lower = String(skycon).toLowerCase();
                if (CONDITION_MAP[lower]) standardKey = CONDITION_MAP[lower];
                else {
                    const upper = String(skycon).toUpperCase();
                    if (CONDITION_MAP[upper]) standardKey = CONDITION_MAP[upper];
                }
            }
        }
        // 3. Standard HA Weather
        else {
            if (CONDITION_MAP[rawState]) standardKey = CONDITION_MAP[rawState];
        }

        let temperature = stateObj.attributes.temperature;
        if (temperature === undefined || temperature === null) temperature = stateObj.state;
        let humidity = stateObj.attributes.humidity;
        let secondaryValue = "";
        const attrName = config.secondary_info_attribute;
        if (attrName) { const attrVal = stateObj.attributes[attrName]; secondaryValue = (attrVal !== undefined && attrVal !== null) ? attrVal : ""; }
        const unit = config.secondary_info_unit || "";

        const showForecast = config.show_forecast !== false;
        const showCurrent = config.show_current !== false;
        const mode = config.forecast_type || 'daily';

        if (showForecast) {
            let foundData = false;
            if (mode === 'hourly' && stateObj.attributes.hourly_forecast) { this._forecastData = stateObj.attributes.hourly_forecast; foundData = true; }
            else if (stateObj.attributes.daily_forecast) { this._forecastData = stateObj.attributes.daily_forecast; foundData = true; }
            if (!foundData && stateObj.attributes.forecast) { this._forecastData = stateObj.attributes.forecast; foundData = true; }
            if (!foundData) {
                const now = Date.now();
                if ((this._forecastData.length === 0 || now - this._lastFetch > 300000) && !this._isFetchingForecast) { this._fetchForecast(hass, entityId, mode); }
            }
        }

        const forecastCount = config.forecast_rows || 5;
        const displayName = config.name || stateObj.attributes.friendly_name || 'Weather';

        this._updateCardContent(displayName, standardKey, temperature, humidity, secondaryValue, unit, this._forecastData, forecastCount, mode, this._isFetchingForecast, showForecast, showCurrent, displayLabel);

        if (this._currentVisualKey !== standardKey) {
            this._currentVisualKey = standardKey;
            this._updateVisuals(standardKey);
        }
    }

    async _fetchForecast(hass, entityId, type) {
        this._isFetchingForecast = true;
        this._lastFetch = Date.now();
        this._requestRender();
        try {
            let data = await this._callService(hass, entityId, type);
            if (!data.length && type === 'daily') data = await this._callService(hass, entityId, 'hourly');
            if (data.length) { this._forecastData = data; this.hass = hass; }
        } catch (e) { console.error("iOS Card Error:", e); } finally { this._isFetchingForecast = false; }
    }

    async _callService(hass, entityId, type) {
        try {
            const res = await hass.connection.sendMessagePromise({ type: 'call_service', domain: 'weather', service: 'get_forecasts', service_data: { entity_id: entityId, type: type }, return_response: true });
            return res?.[entityId]?.forecast || [];
        } catch (e) { return []; }
    }

    setConfig(config) { if (!config) return; this._config = config; try { this._render(); } catch (e) { } }

    _renderEmpty(msg) {
        const card = this.shadowRoot.querySelector('.card');
        if (!card) this._render();
        if (this.shadowRoot.querySelector('.card-content')) {
            this.shadowRoot.querySelector('.card-content').innerHTML = `<div class="msg-center" style="padding: 20px;">${msg}</div>`;
        }
    }

    _requestRender() {
        const fcRow = this.shadowRoot.querySelector('.forecast-row');
        if (fcRow && this._config.show_forecast !== false) fcRow.innerHTML = '<div class="msg-center">加载�?..</div>';
    }

    _render() {
        if (this.shadowRoot.querySelector('.card')) return;
        this.shadowRoot.innerHTML = `<style>${styles}</style><ha-card class="card" style="cursor:pointer;"><div class="canvas-layer"><div class="card-bg" id="bg"></div><canvas id="weather-canvas"></canvas></div><div class="card-content"><div class="header-row" id="header-row"><div class="header-left"><div class="main-info-row"><div class="main-icon" id="main-icon"></div><div class="status-group"><div class="status-text" id="condition-text">--</div><div class="entity-name" id="city-name">--</div></div></div><div class="secondary-text" id="secondary-info"></div></div><div class="header-right"><div class="temp-text" id="temp">--</div><div class="humidity-text" id="humidity-info"></div></div></div><div class="forecast-row" id="forecast-row"></div></div></ha-card>`;
        const card = this.shadowRoot.querySelector('.card');
        card.addEventListener('click', (e) => this._handleTap(e));
        this._resizeObserver = new ResizeObserver(() => this._resizeCanvas());
        this._resizeObserver.observe(card);
    }

    _handleTap(e) {
        const tapAction = this._config.tap_action || { action: 'more-info' };
        if (tapAction.action === 'more-info') {
            const event = new Event('hass-more-info', { bubbles: true, composed: true });
            event.detail = { entityId: this._config.entity };
            this.dispatchEvent(event);
        }
    }

    _resizeCanvas() {
        const canvas = this.shadowRoot.getElementById('weather-canvas');
        if (canvas && canvas.parentElement) {
            const rect = canvas.parentElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            if (rect.width > 0 && (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr)) {
                canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
                this._width = rect.width; this._height = rect.height; this._dpr = dpr;
            }
        }
    }

    _getDayName(dateStr, type) {
        const date = new Date(dateStr);
        if (type === 'hourly') { const h = date.getHours(); return `${h}:00`; }
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return days[date.getDay()];
    }

    _getIcon(standardKey) {
        const iconFile = ICONS[standardKey] || 'CLOUDY.svg';
        const iconKey = iconFile.replace('.svg', '');
        const svgContent = weatherIcons[iconKey] || weatherIcons['CLOUDY'];
        const encoded = encodeURIComponent(svgContent).replace(/'/g, '%27').replace(/"/g, '%22');
        return `<img src="data:image/svg+xml,${encoded}" style="width:100%;height:100%;" alt="${standardKey}">`;
    }

    _updateCardContent(displayName, standardKey, temperature, humidity, secondaryVal, unit, forecastData, forecastCount, forecastType, isFetching, showForecast, showCurrent, customLabel) {
        const headerRow = this.shadowRoot.getElementById('header-row');
        const fcRow = this.shadowRoot.getElementById('forecast-row');

        // Toggle Current
        if (!showCurrent) {
            headerRow.style.display = 'none';
        } else {
            headerRow.style.display = 'flex';

            const mainIconEl = this.shadowRoot.getElementById('main-icon');
            const condEl = this.shadowRoot.getElementById('condition-text');
            const cityEl = this.shadowRoot.getElementById('city-name');
            const secEl = this.shadowRoot.getElementById('secondary-info');
            const tempEl = this.shadowRoot.getElementById('temp');
            const humEl = this.shadowRoot.getElementById('humidity-info');

            const label = customLabel || LABEL_MAP[standardKey] || standardKey;
            condEl.textContent = label;
            cityEl.textContent = displayName;
            mainIconEl.innerHTML = this._getIcon(standardKey);

            if (secondaryVal !== "" && secondaryVal !== undefined) secEl.textContent = `${secondaryVal}${unit}`;
            else secEl.textContent = "";

            tempEl.innerHTML = `${Math.round(temperature)}<span>°C</span>`;
            if (humidity !== "" && humidity !== undefined) humEl.innerHTML = `<svg viewBox="0 0 24 24" style="width:16px;height:16px;" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg> ${humidity}%`;
            else humEl.innerHTML = "";
        }

        // Toggle Forecast
        if (!showForecast) {
            fcRow.style.display = 'none';
        } else {
            fcRow.style.display = 'flex';
            // 关键修复：如�?Header 隐藏，则移除预报顶部的边框和间距，使其紧�?
            if (!showCurrent) {
                fcRow.classList.add('no-border');
            } else {
                fcRow.classList.remove('no-border');
            }

            if (isFetching) fcRow.innerHTML = '<div class="msg-center">加载�?..</div>';
            else if (!forecastData || !forecastData.length) fcRow.innerHTML = '<div class="msg-center">暂无预报</div>';
            else {
                fcRow.innerHTML = '';
                const list = forecastData.slice(0, forecastCount);
                list.forEach(item => {
                    const date = item.datetime;
                    const rawCond = item.condition;
                    let fcKey = 'cloudy';
                    if (CONDITION_MAP[rawCond]) fcKey = CONDITION_MAP[rawCond];
                    else {
                        const lower = String(rawCond).toLowerCase();
                        if (CONDITION_MAP[lower]) fcKey = CONDITION_MAP[lower];
                    }
                    const temp = item.temperature !== undefined ? item.temperature : item.native_temperature;
                    const low = item.templow !== undefined ? item.templow : item.native_templow;
                    const div = document.createElement('div');
                    div.className = 'forecast-item';
                    div.innerHTML = `<span class="fc-day">${this._getDayName(date, forecastType)}</span><div class="fc-icon">${this._getIcon(fcKey)}</div><div class="fc-temp-group"><span class="fc-high">${Math.round(temp)}°</span>${(low !== undefined && forecastType !== 'hourly') ? `<span class="fc-low">${Math.round(low)}°</span>` : ''}</div>`;
                    fcRow.appendChild(div);
                });
            }
        }
    }

    _updateVisuals(standardKey) {
        const config = VISUAL_CONFIG[standardKey] || DEFAULT_CONFIG;
        const bg = this.shadowRoot.getElementById('bg');
        if (bg) {
            let css = '';
            switch (config.gradient) {
                case 'day': css = 'linear-gradient(160deg, #2980b9 0%, #6dd5fa 100%)'; break;
                case 'night': css = 'linear-gradient(160deg, #0f2027 0%, #203a43 100%, #2c5364 100%)'; break;
                case 'cloudy_day': css = 'linear-gradient(160deg, #606c88 0%, #3f4c6b 100%)'; break;
                case 'gray': css = 'linear-gradient(160deg, #bdc3c7 0%, #2c3e50 100%)'; break;
                case 'rain': css = 'linear-gradient(160deg, #203a43 0%, #2c5364 100%)'; break;
                case 'deep_rain': css = 'linear-gradient(160deg, #000000 0%, #434343 100%)'; break;
                case 'storm': css = 'linear-gradient(160deg, #232526 0%, #414345 100%)'; break;
                case 'snow': css = 'linear-gradient(160deg, #83a4d4 0%, #b6fbff 100%)'; break;
                case 'storm_snow': css = 'linear-gradient(160deg, #4B79A1 0%, #283E51 100%)'; break;
                case 'dust': css = 'linear-gradient(160deg, #635f52 0%, #8a8571 100%)'; break; // Darker dust
                case 'sand': css = 'linear-gradient(160deg, #B79891 0%, #94716B 100%)'; break;
                case 'cold': css = 'linear-gradient(160deg, #00416A 0%, #E4E5E6 100%)'; break;
                default: css = 'linear-gradient(160deg, #2980b9 0%, #6dd5fa 100%)';
            }
            bg.style.background = css;
        }
        this._startCanvasAnimation(config);
    }

    _startCanvasAnimation(config) {
        if (this._animationFrame) cancelAnimationFrame(this._animationFrame);
        const canvas = this.shadowRoot.getElementById('weather-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let particles = [];

        // Initialize particles based on type
        if (['rain', 'snow', 'wind', 'fog', 'cloudy', 'hail', 'sleet', 'dust', 'sand'].includes(config.type)) {
            const count = config.density || config.count || 50;
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * 500, y: Math.random() * 300,
                    z: Math.random() * 0.5 + 0.5,
                    len: Math.random() * 20 + 10, size: Math.random() * 2 + 1,
                    vx: 0, vy: 0, opacity: Math.random() * 0.5 + 0.2,
                    // For sleet: 50% chance to be snow
                    isSnow: config.type === 'sleet' && Math.random() > 0.5
                });
            }
        }

        let stars = [];
        let moonCanvas = null;
        if (config.isNight) {
            const dpr = window.devicePixelRatio || 1;
            moonCanvas = document.createElement('canvas');
            moonCanvas.width = 100 * dpr; moonCanvas.height = 100 * dpr;
            const mCtx = moonCanvas.getContext('2d');
            mCtx.scale(dpr, dpr);

            mCtx.fillStyle = '#FEFCD7';
            mCtx.beginPath(); mCtx.arc(50, 50, 30, 0, Math.PI * 2); mCtx.fill();

            mCtx.globalCompositeOperation = 'destination-out';
            mCtx.beginPath(); mCtx.arc(50 - 10, 50 - 8, 28, 0, Math.PI * 2); mCtx.fill();

            for (let i = 0; i < 30; i++) {
                stars.push({
                    x: Math.random() * 500, y: Math.random() * 300,
                    size: Math.random() * 1.5 + 1,
                    opacity: Math.random(),
                    speed: 0.01 + Math.random() * 0.02
                });
            }
        }

        const animate = () => {
            const w = this._width || 300; const h = this._height || 150; const dpr = this._dpr || 1;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save(); ctx.scale(dpr, dpr);

            // Sunny / Night Clear
            if (config.type === 'sunny') {
                const cx = w - 60; const cy = 60; const time = Date.now() * 0.001;
                if (config.isNight) {
                    // Draw Stars
                    stars.forEach(s => {
                        s.opacity += s.speed;
                        if (s.opacity > 1 || s.opacity < 0.2) s.speed = -s.speed;
                        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
                        ctx.beginPath(); ctx.arc(s.x % w, s.y % h, s.size, 0, Math.PI * 2); ctx.fill();
                    });

                    // Draw Moon from off-screen canvas
                    if (moonCanvas) {
                        ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(254, 252, 215, 0.5)';
                        ctx.drawImage(moonCanvas, cx - 50, cy - 50, 100, 100);
                        ctx.shadowBlur = 0;
                    }
                } else {
                    const scale = 1 + Math.sin(time) * 0.05;
                    const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 120 * scale);
                    grad.addColorStop(0, 'rgba(255,255,255,0.8)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
                    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, 120 * scale, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#FFD700'; ctx.beginPath(); ctx.arc(cx, cy, 35, 0, Math.PI * 2); ctx.fill();
                }
            }

            // Wind / Fog / Cloudy / Dust / Sand (Advanced Volumetric)
            if (['wind', 'fog', 'cloudy', 'dust', 'sand'].includes(config.type)) {
                particles.forEach(p => {
                    // Movement Logic
                    let speed = (config.speed || 5) * p.z;

                    // Specific behaviors
                    if (config.type === 'fog') {
                        speed *= 0.1; // Very slow drift
                        // Add vertical bobbing for fog
                        p.y += Math.sin(Date.now() * 0.001 + p.x * 0.01) * 0.2;
                    } else if (config.type === 'dust') {
                        speed *= 0.15; // Slow drift
                    } else if (config.type === 'sand') {
                        speed *= 0.8; // Faster, wind-driven
                    } else if (config.type === 'cloudy') {
                        speed *= 0.1;
                    }

                    p.x += speed;
                    if (p.x > w + 100) p.x = -100;
                    if (p.x < -100) p.x = w + 100;

                    // Rendering Logic
                    ctx.beginPath();

                    if (['fog', 'dust', 'sand'].includes(config.type)) {
                        // Soft Volumetric Rendering
                        const radius = (p.size * 20) * p.z; // Large soft puffs
                        // Ensure radius is positive
                        if (radius > 0) {
                            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
                            const baseColor = config.color || '#FFFFFF';

                            grad.addColorStop(0, baseColor); // Center
                            grad.addColorStop(1, 'rgba(255,255,255,0)'); // Edge transparent

                            ctx.fillStyle = grad;
                            ctx.globalAlpha = p.opacity * (config.opacity || 0.3); // Low opacity for layering
                            ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.globalAlpha = 1;
                        }
                    } else if (config.type === 'cloudy') {
                        // Existing cloudy logic
                        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 40 * p.z);
                        grad.addColorStop(0, `rgba(255,255,255, ${0.1 * p.opacity})`); grad.addColorStop(1, 'rgba(255,255,255,0)');
                        ctx.fillStyle = grad; ctx.arc(p.x, p.y, 40 * p.z, 0, Math.PI * 2); ctx.fill();
                    } else {
                        // Wind (Line based)
                        ctx.strokeStyle = config.color || '#FFFFFF';
                        ctx.globalAlpha = p.opacity * 0.6;
                        ctx.lineWidth = 2; ctx.lineCap = 'round';
                        ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + p.len * p.z, p.y);
                        ctx.stroke(); ctx.globalAlpha = 1;
                    }
                });
            }

            // Rain
            if (config.type === 'rain') {
                if (config.lightning && Math.random() < 0.005) { ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(0, 0, w, h); }
                ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
                particles.forEach(p => {
                    p.y += (config.speed || 15) * p.z; if (p.y > h) { p.y = -10; p.x = Math.random() * w; }
                    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + p.len); ctx.stroke();
                });
            }

            // Snow
            if (config.type === 'snow') {
                ctx.fillStyle = '#FFFFFF';
                const time = Date.now() * 0.001;
                particles.forEach(p => {
                    p.y += (config.speedY || 2) * p.z;
                    // Add sine wave drift
                    p.x += (config.speedX || 0.5) * p.z + Math.sin(time + p.z * 10) * 0.5;

                    if (p.y > h) { p.y = -5; p.x = Math.random() * w; }
                    if (p.x > w) { p.x = 0; } else if (p.x < 0) { p.x = w; }

                    ctx.globalAlpha = p.opacity; ctx.beginPath();
                    // Draw circle
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
            }

            // Hail (Small granules, fast)
            if (config.type === 'hail') {
                ctx.fillStyle = '#E0E0E0'; // Slightly gray for ice
                particles.forEach(p => {
                    p.y += (config.speed || 20) * p.z; // Fast falling
                    if (p.y > h) { p.y = -5; p.x = Math.random() * w; }

                    ctx.globalAlpha = p.opacity * 0.8;
                    ctx.beginPath();
                    // Small granules
                    ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
            }

            // Sleet (Rain + Snow)
            if (config.type === 'sleet') {
                const time = Date.now() * 0.001;
                particles.forEach(p => {
                    if (p.isSnow) {
                        // Snow logic
                        p.y += (config.speed || 5) * 0.5 * p.z; // Snow falls slower than rain
                        p.x += Math.sin(time + p.z * 10) * 0.5;
                        if (p.y > h) { p.y = -5; p.x = Math.random() * w; }
                        if (p.x > w) { p.x = 0; } else if (p.x < 0) { p.x = w; }

                        ctx.fillStyle = '#FFFFFF';
                        ctx.globalAlpha = p.opacity;
                        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
                    } else {
                        // Rain logic
                        p.y += (config.speed || 12) * p.z;
                        if (p.y > h) { p.y = -10; p.x = Math.random() * w; }

                        ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1.5;
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x, p.y + p.len); ctx.stroke();
                    }
                });
                ctx.globalAlpha = 1;
            }

            ctx.restore();
            this._animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
}
customElements.define('ios-weather-card', IOSWeatherCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "ios-weather-card",
    name: "iOS Weather Card",
    preview: true,
    description: "iOS 18 风格的天气卡片，支持动态动画",
    documentationURL: "https://github.com/JochenZhou/ios-weather-card"
});
