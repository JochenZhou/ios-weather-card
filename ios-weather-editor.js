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
                const entities = Object.keys(hass.states).filter(eid => eid.startsWith('weather.')).sort();
                picker.innerHTML = '<option value="">请选择实体...</option>';
                entities.forEach(eid => {
                    const option = document.createElement('option');
                    option.value = eid;
                    option.textContent = hass.states[eid].attributes.friendly_name || eid;
                    picker.appendChild(option);
                });
                if (this._config && this._config.entity) picker.value = this._config.entity;
            }
            this.updateAttributesDropdown();
        }
    }

    _createDOM() {
        this.shadowRoot.innerHTML = `
            <style>
                .card-config { display: flex; flex-direction: column; gap: 16px; }
                .row { display: flex; flex-direction: column; gap: 4px; }
                .label { font-size: 14px; font-weight: 500; color: var(--primary-text-color); }
                select, input[type="text"], input[type="number"] { width: 100%; padding: 8px; border: 1px solid var(--divider-color); border-radius: 4px; background: var(--card-background-color); color: var(--primary-text-color); box-sizing: border-box; }
                .switch-row { display: flex; align-items: center; justify-content: space-between; }
                ha-switch { margin-left: auto; }
            </style>
            <div class="card-config">
                <div class="row"><label class="label">实体 (必须)</label><select id="weather-picker"></select></div>
                <div class="row"><label class="label">名称</label><input type="text" id="name-input" placeholder="留空使用实体名称"></div>
                <div class="row"><label class="label">次要信息属性</label><select id="attr-select"><option value="">无</option></select></div>
                <div class="row"><label class="label">次要信息单位</label><input type="text" id="unit-input"></div>
                <div class="row"><label class="label">预报类型</label><select id="forecast-type"><option value="daily">每日</option><option value="hourly">每小时</option></select></div>
                <div class="switch-row"><label class="label">显示当前天气</label><ha-switch id="show-current" checked></ha-switch></div>
                <div class="switch-row"><label class="label">显示预报</label><ha-switch id="show-forecast" checked></ha-switch></div>
                <div class="row"><label class="label">预报行数</label><input type="number" id="forecast-rows" min="1" max="10" value="5"></div>
            </div>
        `;
        this._domCreated = true;
        this.shadowRoot.getElementById('weather-picker').addEventListener('change', e => this._valueChanged('entity', e.target.value));
        this.shadowRoot.getElementById('name-input').addEventListener('input', e => this._valueChanged('name', e.target.value));
        this.shadowRoot.getElementById('forecast-type').addEventListener('change', e => this._updateConfig({ forecast_type: e.target.value }));
        this.shadowRoot.getElementById('show-current').addEventListener('change', e => this._updateConfig({ show_current: e.target.checked }));
        this.shadowRoot.getElementById('show-forecast').addEventListener('change', e => this._updateConfig({ show_forecast: e.target.checked }));
        this.shadowRoot.getElementById('forecast-rows').addEventListener('input', e => this._valueChanged('forecast_rows', parseInt(e.target.value)));
        this.shadowRoot.getElementById('attr-select').addEventListener('change', e => this._valueChanged('secondary_info_attribute', e.target.value));
        this.shadowRoot.getElementById('unit-input').addEventListener('input', e => this._valueChanged('secondary_info_unit', e.target.value));
    }

    _updateUI() {
        if (!this._domCreated || !this._config) return;
        const config = this._config;
        const picker = this.shadowRoot.getElementById('weather-picker');
        if (picker && config.entity) picker.value = config.entity;
        this.shadowRoot.getElementById('name-input').value = config.name || '';
        this.shadowRoot.getElementById('forecast-type').value = config.forecast_type || 'daily';
        this.shadowRoot.getElementById('show-current').checked = config.show_current !== false;
        this.shadowRoot.getElementById('show-forecast').checked = config.show_forecast !== false;
        this.shadowRoot.getElementById('forecast-rows').value = config.forecast_rows || 5;
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
        select.innerHTML = '<option value="">无</option>';
        const ignored = ['friendly_name', 'icon', 'supported_features', 'attribution', 'custom_ui_more_info', 'forecast', 'daily_forecast', 'hourly_forecast'];
        Object.keys(stateObj.attributes).sort().forEach(attr => {
            if (ignored.includes(attr)) return;
            const option = document.createElement('option');
            option.value = attr;
            option.textContent = `${attr}: ${stateObj.attributes[attr]}`;
            select.appendChild(option);
        });
        select.value = currentVal;
    }
}
customElements.define("ios-weather-card-editor", IOSWeatherCardEditor);