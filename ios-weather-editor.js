export class IOSWeatherCardEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._domCreated = false;
    }

    setConfig(config) {
        this._config = config;
        if (!this._domCreated) {
            this._createDOM();
        }
        this._updateUI();
    }

    set hass(hass) {
        this._hass = hass;
        if (this._domCreated) {
            const picker = this.shadowRoot.getElementById('weather-picker');
            if (picker && hass) {
                const currentVal = picker.value;
                picker.innerHTML = '';

                const entities = Object.keys(hass.states).filter(eid => eid.startsWith('weather.'));
                entities.sort();

                // Add an empty option if no entity is selected yet or to allow clearing
                const emptyOpt = document.createElement('option');
                emptyOpt.value = '';
                emptyOpt.textContent = '请选择实体...';
                picker.appendChild(emptyOpt);

                entities.forEach(eid => {
                    const option = document.createElement('option');
                    option.value = eid;
                    option.textContent = `${hass.states[eid].attributes.friendly_name || eid} (${eid})`;
                    picker.appendChild(option);
                });

                if (this._config && this._config.entity) {
                    picker.value = this._config.entity;
                }
            }
            this.updateAttributesDropdown();
        }
    }

    _createDOM() {
        this.shadowRoot.innerHTML = `
            <style>
                .card-config { display: flex; flex-direction: column; gap: 24px; padding: 16px; color: var(--primary-text-color); }
                .group { display: flex; flex-direction: column; gap: 12px; }
                .row { display: flex; flex-direction: column; gap: 4px; }
                .label { font-size: 12px; color: var(--secondary-text-color); font-weight: 500; }
                ha-entity-picker, input, select { width: 100%; }
                input, select { padding: 8px; border-radius: 4px; border: 1px solid var(--divider-color, #ccc); background: var(--card-background-color, #fff); color: var(--primary-text-color, #000); box-sizing: border-box; }
                .radio-group { display: flex; flex-direction: column; gap: 12px; }
                .radio-item { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 16px; }
                input[type="radio"] { margin: 0; width: 20px; height: 20px; accent-color: var(--primary-color); cursor: pointer; }
                .split-row { display: flex; gap: 12px; }
                .split-item { flex: 1; }
                .slider-row { display: flex; align-items: center; gap: 16px; }
                ha-slider { flex: 1; }
            </style>
            <div class="card-config">
                <div class="group">
                    <div class="row"><label class="label">实体 (必须)</label><select id="weather-picker"></select></div>
                    <div class="row"><label class="label">名称</label><input type="text" id="name-input" placeholder="默认使用实体名称"></div>
                </div>
                <div class="split-row">
                    <div class="split-item"><label class="label">次要信息属性</label><select id="attr-select"><option value="">-- 不显示 --</option></select></div>
                    <div class="split-item"><label class="label">主题 (可选)</label><input type="text" id="unit-input" placeholder="单位/后缀"></div>
                </div>
                <div class="group">
                    <div class="label">选择预报类型</div>
                    <div class="radio-group">
                        <label class="radio-item"><input type="radio" name="forecast_type" value="daily"> 每天 (Daily)</label>
                        <label class="radio-item"><input type="radio" name="forecast_type" value="hourly"> 每小时 (Hourly)</label>
                    </div>
                </div>
                <div class="group">
                    <div class="label">要显示的天气</div>
                    <div class="radio-group">
                        <label class="radio-item"><input type="radio" name="show_mode" value="both"> 显示当前天气和预报</label>
                        <label class="radio-item"><input type="radio" name="show_mode" value="current"> 只显示当前天气</label>
                        <label class="radio-item"><input type="radio" name="show_mode" value="forecast"> 只显示预报</label>
                    </div>
                </div>
                <div class="group">
                    <div class="label">要显示的最大预报元素数</div>
                    <div class="slider-row"><ha-slider id="forecast-slider" min="1" max="7" step="1" pin discrete markers></ha-slider><span id="forecast-val" style="min-width:20px; text-align:center;">5</span></div>
                </div>
            </div>
        `;
        this._domCreated = true;
        this.shadowRoot.getElementById('weather-picker').addEventListener('change', e => this._valueChanged('entity', e.target.value));
        this.shadowRoot.getElementById('name-input').addEventListener('change', e => this._valueChanged('name', e.target.value));
        this.shadowRoot.querySelectorAll('input[name="forecast_type"]').forEach(r => r.addEventListener('change', e => { if (e.target.checked) this._updateConfig({ forecast_type: e.target.value }); }));
        this.shadowRoot.querySelectorAll('input[name="show_mode"]').forEach(r => r.addEventListener('change', e => {
            if (e.target.checked) {
                const val = e.target.value;
                if (val === 'both') this._updateConfig({ show_current: true, show_forecast: true });
                else if (val === 'current') this._updateConfig({ show_current: true, show_forecast: false });
                else if (val === 'forecast') this._updateConfig({ show_current: false, show_forecast: true });
            }
        }));
        this.shadowRoot.getElementById('forecast-slider').addEventListener('change', e => {
            this.shadowRoot.getElementById('forecast-val').textContent = e.target.value;
            this._valueChanged('forecast_rows', e.target.value);
        });
        this.shadowRoot.getElementById('attr-select').addEventListener('change', e => this._valueChanged('secondary_info_attribute', e.target.value));
        this.shadowRoot.getElementById('unit-input').addEventListener('change', e => this._valueChanged('secondary_info_unit', e.target.value));
    }

    _updateUI() {
        if (!this._domCreated || !this._config) return;
        const config = this._config;
        const picker = this.shadowRoot.getElementById('weather-picker');
        if (picker && config.entity) { picker.value = config.entity; }
        this.shadowRoot.getElementById('name-input').value = config.name || '';

        const fType = config.forecast_type || 'daily';
        const fRadio = this.shadowRoot.querySelector(`input[name="forecast_type"][value="${fType}"]`);
        if (fRadio) fRadio.checked = true;

        let mode = 'both';
        if (config.show_current === false && config.show_forecast !== false) mode = 'forecast';
        else if (config.show_current !== false && config.show_forecast === false) mode = 'current';
        const mRadio = this.shadowRoot.querySelector(`input[name="show_mode"][value="${mode}"]`);
        if (mRadio) mRadio.checked = true;

        const rows = config.forecast_rows || 5;
        this.shadowRoot.getElementById('forecast-slider').value = rows;
        this.shadowRoot.getElementById('forecast-val').textContent = rows;

        this.shadowRoot.getElementById('attr-select').value = config.secondary_info_attribute || '';
        this.shadowRoot.getElementById('unit-input').value = config.secondary_info_unit || '';
    }

    _valueChanged(key, value) {
        if (!this._config) return;
        const newConfig = { ...this._config };
        if (value === '' || value === undefined) delete newConfig[key]; else newConfig[key] = value;
        this._fire(newConfig);
    }

    _updateConfig(updates) {
        if (!this._config) return;
        const newConfig = { ...this._config, ...updates };
        this._fire(newConfig);
    }

    _fire(newConfig) {
        const event = new Event("config-changed", { bubbles: true, composed: true });
        event.detail = { config: newConfig };
        this.dispatchEvent(event);
    }

    updateAttributesDropdown() {
        if (!this._hass || !this._config || !this._config.entity) return;
        const stateObj = this._hass.states[this._config.entity];
        const select = this.shadowRoot.getElementById('attr-select');
        if (!stateObj || !select) return;
        const currentVal = this._config.secondary_info_attribute || '';
        select.innerHTML = '<option value="">-- 不显示 --</option>';
        const attributes = Object.keys(stateObj.attributes).sort();
        const ignored = ['friendly_name', 'icon', 'supported_features', 'attribution', 'custom_ui_more_info', 'forecast', 'daily_forecast', 'hourly_forecast'];
        attributes.forEach(attr => { if (ignored.includes(attr)) return; const option = document.createElement('option'); option.value = attr; option.textContent = `${attr} (${stateObj.attributes[attr]})`; if (attr === currentVal) option.selected = true; select.appendChild(option); });
        if (currentVal && !attributes.includes(currentVal)) select.value = ""; else select.value = currentVal;
    }
}
customElements.define("ios-weather-card-editor", IOSWeatherCardEditor);