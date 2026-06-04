// Checagem leve de suporte a WebGL — fica SEPARADA do glQuad (que importa `ogl`)
// de propósito: assim os componentes podem decidir se vão usar o shader SEM
// arrastar a `ogl` para o bundle inicial. O createShaderQuad é importado
// dinamicamente só quando o efeito realmente vai rodar.

/** WebGL disponível? Usado por componentes para decidir entre shader e CSS. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
