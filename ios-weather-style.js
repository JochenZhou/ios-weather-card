export const styles = `
    :host { display: block; height: auto; } 
    .card { 
        position: relative; 
        width: 100%; 
        height: auto; 
        min-height: 110px; 
        border-radius: 24px; 
        overflow: hidden; 
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif; 
        box-shadow: none; 
        border: none;
        color: white; 
        background: #333; 
        user-select: none; 
        container-type: inline-size; 
    }
    .canvas-layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
    .card-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: background 1s ease; }
    canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block; }
    
    .card-content { 
        position: relative; 
        z-index: 2; 
        padding: clamp(16px, 5cqw, 24px); 
        display: flex; 
        flex-direction: column; 
    }
    
    /* Header */
    .header-row { display: flex; justify-content: space-between; align-items: flex-start; }
    .header-left { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
    .main-info-row { display: flex; align-items: center; gap: 12px; }
    .main-icon { width: 48px; height: 48px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
    .status-group { display: flex; flex-direction: column; }
    .status-text { font-size: 32px; font-weight: 600; line-height: 1.1; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
    .entity-name { font-size: 14px; opacity: 0.9; font-weight: 500; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }
    .secondary-text { font-size: 13px; opacity: 0.9; margin-top: 6px; display: flex; align-items: center; gap: 4px; text-shadow: 0 1px 4px rgba(0,0,0,0.6); padding-left: 2px; }
    .header-right { display: flex; flex-direction: column; align-items: flex-end; }
    .temp-text { font-size: 32px; font-weight: 600; line-height: 1.1; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
    .humidity-text { font-size: 14px; opacity: 0.9; font-weight: 500; margin-top: 6px; display: flex; align-items: center; gap: 4px; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }
    
    /* Forecast */
    .forecast-row { 
        display: flex; 
        justify-content: space-between; 
        gap: 12px; 
        padding-top: 12px; 
        margin-top: 12px;
    }
    .forecast-item { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
    .fc-day { font-size: 14px; opacity: 0.9; font-weight: 500; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }
    .fc-icon { width: 32px; height: 32px; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.4)); }
    .fc-temp-group { display: flex; flex-direction: column; align-items: center; line-height: 1.2; }
    .fc-high { font-size: 16px; font-weight: 600; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }
    .fc-low { font-size: 13px; opacity: 0.8; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }
    .msg-center { width: 100%; text-align: center; font-size: 12px; opacity: 0.7; text-shadow: 0 1px 2px rgba(0,0,0,0.5); align-self: center; }
`;