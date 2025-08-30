import pandas as pd
from deep_translator import GoogleTranslator

# Charger ton fichier
excel_file = "Genral Env.xlsx"
df = pd.read_excel(excel_file, sheet_name=None)

translator = GoogleTranslator(source="en", target="fr")

def safe_translate(text):
    """Traduit un texte en gérant les erreurs et les textes longs"""
    try:
        if not text or text.lower() == "nan":
            return text
        # Si le texte est trop long, on le découpe en phrases
        if len(text) > 4000:  # limite API
            parts = text.split(". ")
            translated_parts = [translator.translate(p) for p in parts if p.strip()]
            return ". ".join(translated_parts)
        return translator.translate(text)
    except Exception as e:
        return f"[NON TRADUIT] {text}"

# Traduire chaque feuille
for sheet_name, sheet in df.items():
    print(f"Traduction de la feuille : {sheet_name} ...")
    for col in sheet.columns:
        if sheet[col].dtype == "object":  # seulement colonnes texte
            sheet[col] = sheet[col].astype(str).apply(safe_translate)

# Sauvegarder
output_file = "fichier_traduit.xlsx"
with pd.ExcelWriter(output_file, engine="openpyxl") as writer:
    for sheet_name, sheet in df.items():
        sheet.to_excel(writer, sheet_name=sheet_name, index=False)

print("✅ Traduction terminée et sauvegardée dans", output_file)
