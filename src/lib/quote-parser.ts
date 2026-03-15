/* ═══════════════════════════════════════════
   Rule-based AI Quote Parser
   Parses natural language messages to extract
   installation parameters for auto-quoting.
   ═══════════════════════════════════════════ */

interface ParsedQuote {
    cableType?: string;
    cableMeters?: number;
    points?: number;
    installationType?: string;
    installationMeters?: number;
    materials?: { canaleta?: number; tubo_corrugado?: number; regata?: number };
    additionalWork?: { switch?: boolean; router?: boolean; network_config?: boolean; patch_panel?: boolean };
    rack?: string;
    urgency?: string;
    confidence: number; // 0–100
    summary: string;
}

const CABLE_PATTERNS: Record<string, RegExp[]> = {
    cat5e: [/cat\s*5e/i, /categoría?\s*5e/i, /categoria?\s*5e/i],
    cat6: [/cat\s*6(?!\s*[aA7])/i, /categoría?\s*6(?!\s*[aA7])/i, /categoria?\s*6(?!\s*[aA7])/i],
    cat6a: [/cat\s*6\s*a/i, /categoría?\s*6\s*a/i, /categoria?\s*6\s*a/i],
    cat7: [/cat\s*7/i, /categoría?\s*7/i, /categoria?\s*7/i],
};

const INSTALL_PATTERNS: Record<string, RegExp[]> = {
    superficial: [/superficial/i, /canaleta/i, /canal/i, /surface/i, /cable\s*tray/i, /открыт/i, /канал/i],
    techo: [/techo\s*t[eé]cnico/i, /falso\s*techo/i, /ceiling/i, /suspended/i, /потолок/i, /подвес/i],
    empotrado_existente: [/empotrado\s*existente/i, /existing\s*conduit/i, /existente/i, /штроб.*существ/i],
    empotrado_nuevo: [/empotrado\s*nuevo/i, /new\s*conduit/i, /nuevo.*empotrado/i, /штроб.*нов/i],
    industrial: [/industrial/i, /nave/i, /fábrica/i, /fabrica/i, /warehouse/i, /factory/i, /промышлен/i, /склад/i, /завод/i],
};

const RACK_PATTERNS: Record<string, RegExp[]> = {
    small: [/rack\s*pequeño/i, /small\s*rack/i, /маленьк.*шкаф/i, /rack\s*peque/i],
    professional: [/rack\s*profesional/i, /professional\s*rack/i, /профессион.*шкаф/i],
    with_patch: [/rack.*patch/i, /patch.*rack/i, /rack\s*con\s*patch/i, /шкаф.*патч/i],
};

const URGENCY_PATTERNS: Record<string, RegExp[]> = {
    urgente: [/urgent[ae]?/i, /rápido/i, /rapido/i, /cuanto\s*antes/i, /lo\s*antes/i, /срочн/i, /быстр/i],
    weekend: [/fin\s*de\s*semana/i, /weekend/i, /s[aá]bado/i, /sabado/i, /domingo/i, /выходн/i, /суббот/i, /воскресен/i],
};

function extractNumber(text: string, patterns: RegExp[]): number | undefined {
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const numStr = match[1] || match[2];
            if (numStr) {
                const num = parseInt(numStr, 10);
                if (!isNaN(num) && num > 0 && num < 100000) return num;
            }
        }
    }
    return undefined;
}

export function parseQuoteMessage(message: string): ParsedQuote {
    const text = message.toLowerCase();
    let confidence = 0;
    const details: string[] = [];

    // Cable type
    let cableType: string | undefined;
    for (const [type, patterns] of Object.entries(CABLE_PATTERNS)) {
        if (patterns.some(p => p.test(text))) {
            cableType = type;
            confidence += 20;
            details.push(`Cable: ${type.toUpperCase()}`);
            break;
        }
    }

    // Points
    const pointPatterns = [
        /(\d+)\s*(?:puntos?\s*(?:de\s*)?(?:red|datos|ethernet|network)?|points?|точ[ек])/i,
        /(?:puntos?\s*(?:de\s*)?(?:red|datos)?|points?|точ[ек])\s*[:=]?\s*(\d+)/i,
        /necesito\s*(\d+)/i,
        /quiero\s*(\d+)/i,
        /instalar\s*(\d+)/i,
    ];
    const points = extractNumber(text, pointPatterns);
    if (points) {
        confidence += 20;
        details.push(`${points} puntos`);
    }

    // Meters
    const meterPatterns = [
        /(\d+)\s*(?:metros?\s*(?:de\s*)?(?:cable)?|m\s*(?:de\s*cable)?)/i,
        /(?:metros?\s*(?:de\s*cable)?)\s*[:=]?\s*(\d+)/i,
        /cable\s*[:=]?\s*(\d+)\s*m/i,
    ];
    const cableMeters = extractNumber(text, meterPatterns);
    if (cableMeters) {
        confidence += 15;
        details.push(`${cableMeters}m cable`);
    }

    // Installation meters
    const installMeterPatterns = [
        /(\d+)\s*m(?:etros?)?\s*(?:de\s*)?(?:instalaci[oó]n|canalización|монтаж)/i,
        /(?:instalaci[oó]n|canalización)\s*[:=]?\s*(\d+)\s*m/i,
    ];
    const installationMeters = extractNumber(text, installMeterPatterns);
    if (installationMeters) {
        confidence += 10;
        details.push(`${installationMeters}m instalación`);
    }

    // Installation type
    let installationType: string | undefined;
    for (const [type, patterns] of Object.entries(INSTALL_PATTERNS)) {
        if (patterns.some(p => p.test(text))) {
            installationType = type;
            confidence += 15;
            details.push(`Tipo: ${type}`);
            break;
        }
    }

    // Rack
    let rack: string | undefined;
    for (const [type, patterns] of Object.entries(RACK_PATTERNS)) {
        if (patterns.some(p => p.test(text))) {
            rack = type;
            confidence += 5;
            details.push(`Rack: ${type}`);
            break;
        }
    }

    // Urgency
    let urgency: string | undefined;
    for (const [type, patterns] of Object.entries(URGENCY_PATTERNS)) {
        if (patterns.some(p => p.test(text))) {
            urgency = type;
            confidence += 5;
            details.push(`Urgencia: ${type}`);
            break;
        }
    }

    // Additional work detection
    const additionalWork: Record<string, boolean> = {};
    if (/switch/i.test(text)) { additionalWork.switch = true; confidence += 3; }
    if (/router/i.test(text)) { additionalWork.router = true; confidence += 3; }
    if (/configura(ci[oó]n|r)\s*(de\s*)?(la\s*)?red/i.test(text) || /network\s*config/i.test(text) || /настройк/i.test(text)) {
        additionalWork.network_config = true; confidence += 3;
    }
    if (/patch\s*panel/i.test(text) || /патч.?панел/i.test(text)) {
        additionalWork.patch_panel = true; confidence += 3;
    }

    // Materials
    const materials: Record<string, number> = {};
    const canaletaMatch = text.match(/(\d+)\s*m(?:etros?)?\s*(?:de\s*)?canaleta/i);
    if (canaletaMatch) materials.canaleta = parseInt(canaletaMatch[1]);
    const corrugadoMatch = text.match(/(\d+)\s*m(?:etros?)?\s*(?:de\s*)?(?:tubo\s*)?corrugado/i);
    if (corrugadoMatch) materials.tubo_corrugado = parseInt(corrugadoMatch[1]);
    const regataMatch = text.match(/(\d+)\s*m(?:etros?)?\s*(?:de\s*)?regata/i);
    if (regataMatch) materials.regata = parseInt(regataMatch[1]);

    confidence = Math.min(100, confidence);

    const summary = details.length > 0
        ? `Detectado: ${details.join(', ')}. Confianza: ${confidence}%`
        : 'No se pudieron detectar parámetros de instalación. Por favor, especifique más detalles.';

    return {
        cableType,
        cableMeters,
        points,
        installationType,
        installationMeters: installationMeters,
        materials: Object.keys(materials).length > 0 ? materials as any : undefined,
        additionalWork: Object.keys(additionalWork).length > 0 ? additionalWork as any : undefined,
        rack,
        urgency,
        confidence,
        summary,
    };
}
