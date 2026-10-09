import {
  STUDENT_PIN_LENGTH,
  hasStudentPinFormat,
  isValidStudentPin,
  isWeakStudentPin,
} from "@electrolitos/shared/student-pin";
import { describe, expect, it } from "vitest";

describe("formato del PIN", () => {
  it("acepta exactamente cuatro dígitos", () => {
    expect(STUDENT_PIN_LENGTH).toBe(4);
    expect(hasStudentPinFormat("7391")).toBe(true);
  });

  it("rechaza longitudes distintas de cuatro", () => {
    expect(hasStudentPinFormat("739")).toBe(false);
    expect(hasStudentPinFormat("73915")).toBe(false);
    expect(hasStudentPinFormat("")).toBe(false);
  });

  it("rechaza lo que no sean dígitos", () => {
    expect(hasStudentPinFormat("73a1")).toBe(false);
    expect(hasStudentPinFormat("ABCD")).toBe(false);
    expect(hasStudentPinFormat("73 1")).toBe(false);
  });
});

describe("PIN débil", () => {
  it("marca los cuatro dígitos repetidos", () => {
    expect(isWeakStudentPin("0000")).toBe(true);
    expect(isWeakStudentPin("1111")).toBe(true);
    expect(isWeakStudentPin("9999")).toBe(true);
  });

  it("marca las secuencias corridas en ambos sentidos", () => {
    expect(isWeakStudentPin("1234")).toBe(true);
    expect(isWeakStudentPin("6789")).toBe(true);
    expect(isWeakStudentPin("4321")).toBe(true);
    expect(isWeakStudentPin("3210")).toBe(true);
  });

  it("deja pasar lo que no es un patrón obvio", () => {
    expect(isWeakStudentPin("7391")).toBe(false);
    expect(isWeakStudentPin("2468")).toBe(false);
    expect(isWeakStudentPin("1243")).toBe(false);
    /* Un salto constante distinto de 1 no se considera débil: nadie lo adivina al primer intento. */
    expect(isWeakStudentPin("1357")).toBe(false);
  });
});

describe("PIN válido", () => {
  it("exige formato correcto y que no sea un patrón obvio", () => {
    expect(isValidStudentPin("7391")).toBe(true);
    expect(isValidStudentPin("1234")).toBe(false);
    expect(isValidStudentPin("0000")).toBe(false);
    expect(isValidStudentPin("739")).toBe(false);
  });
});
