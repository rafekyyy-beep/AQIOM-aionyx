/**
 * Calculator Tool - حاسبة علمية متقدمة
 */

type MathFunction = (n: number) => number;

const functions: Record<string, MathFunction> = {
  sqrt: Math.sqrt,
  sin: (x: number) => Math.sin(x * Math.PI / 180),
  cos: (x: number) => Math.cos(x * Math.PI / 180),
  tan: (x: number) => Math.tan(x * Math.PI / 180),
  log: Math.log10,
  ln: Math.log,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
};

export function calculate(expression: string): string {
  try {
    let cleaned = expression
      .replace(/sqrt\(([^)]+)\)/g, (_, n) => `Math.sqrt(${n})`)
      .replace(/sin\(([^)]+)\)/g, (_, n) => `Math.sin(${n} * Math.PI / 180)`)
      .replace(/cos\(([^)]+)\)/g, (_, n) => `Math.cos(${n} * Math.PI / 180)`)
      .replace(/tan\(([^)]+)\)/g, (_, n) => `Math.tan(${n} * Math.PI / 180)`)
      .replace(/log\(([^)]+)\)/g, (_, n) => `Math.log10(${n})`)
      .replace(/ln\(([^)]+)\)/g, (_, n) => `Math.log(${n})`)
      .replace(/\^/g, '**')
      .replace(/π|pi/g, String(Math.PI))
      .replace(/e(?!\d)/g, String(Math.E))
      .replace(/!/g, 'factorial')
      .replace(/%/g, '/100');

    const allowed = /^[0-9\s\+\-\*\/\(\)\.\%\*\*]+$/;
    if (!allowed.test(cleaned.replace(/Math\.(sqrt|sin|cos|tan|log10|log|PI|E)/g, ''))) {
      return `❌ تعبير غير مدعوم: ${expression}`;
    }

    const result = Function('"use strict"; return (' + cleaned + ')')();
    
    if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
      return `❌ نتيجة غير صالحة: ${expression}`;
    }

    return `✅ النتيجة: ${Number(result.toFixed(10)).toString()}`;
  } catch (error) {
    return `❌ خطأ في الحساب: ${expression}`;
  }
}

export const calculatorTool = {
  name: 'calculator',
  description: 'حاسبة علمية: جمع، طرح، ضرب، قسمة، جذر تربيعي، قوى، مثلثات، لوغاريتمات',
  execute: ({ expression }: { expression: string }) => calculate(expression),
};
