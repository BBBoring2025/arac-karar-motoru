/**
 * MTV girdi validasyonu
 */
export function validateMTVInput(input: {
  motorHacmi: number;
  aracYasi: number;
  yakitTupu: string;
}): string | null {
  if (input.yakitTupu !== "elektrik" && input.motorHacmi <= 0) {
    return "Elektrikli olmayan araclar icin motor hacmi gereklidir";
  }
  if (input.aracYasi < 0) {
    return "Arac yasi negatif olamaz";
  }
  const validFuelTypes = ["benzin", "dizel", "lpg", "hibrit", "elektrik"];
  if (!validFuelTypes.includes(input.yakitTupu)) {
    return `Gecersiz yakit tipi: ${input.yakitTupu}. Gecerli: ${validFuelTypes.join(", ")}`;
  }
  return null; // valid
}
