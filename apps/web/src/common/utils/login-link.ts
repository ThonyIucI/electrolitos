/** El nombre del parámetro va en español porque el enlace lo ven los apoderados. */
export const LOGIN_CODE_PARAM = "codigo";

/**
 * Enlace que lleva al chico directo al ingreso con su código ya puesto. Se arma contra el
 * origen actual porque el profesor copia desde la propia app: en local sale la IP de la
 * red y en producción el dominio, sin configurar nada.
 *
 * Vive en `common/` y no en el módulo de inscripciones porque lo comparten los dos
 * extremos: el panel que arma el enlace y la ruta `/login` que lo lee.
 */
export const buildStudentLoginUrl = (accessCode: string): string =>
  `${window.location.origin}/login?${LOGIN_CODE_PARAM}=${accessCode}`;
