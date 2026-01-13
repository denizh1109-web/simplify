"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TargetLanguage =
  | "Deutsch"
  | "Englisch"
  | "Türkisch"
  | "Ukrainisch"
  | "Arabisch"
  | "Polnisch"
  | "Russisch"
  | "Serbokroatisch"
  | "Rumänisch"
  | "Italienisch"
  | "Spanisch"
  | "Französisch";

const LANGUAGES: Array<{ value: TargetLanguage; label: string; dir?: "ltr" | "rtl" }> = [
  { value: "Deutsch", label: "Deutsch" },
  { value: "Englisch", label: "English" },
  { value: "Türkisch", label: "Türkçe" },
  { value: "Ukrainisch", label: "Українська" },
  { value: "Arabisch", label: "العربية", dir: "rtl" },
  { value: "Polnisch", label: "Polski" },
  { value: "Russisch", label: "Русский" },
  { value: "Serbokroatisch", label: "Srpskohrvatski" },
  { value: "Rumänisch", label: "Română" },
  { value: "Italienisch", label: "Italiano" },
  { value: "Spanisch", label: "Español" },
  { value: "Französisch", label: "Français" },
];

const DISCLAIMER =
  "Dies ist eine KI-generierte Vereinfachung zur Verständnishilfe und stellt keine Rechtsberatung dar.";

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

async function readTextFile(file: File) {
  return await file.text();
}

async function preprocessImageToBlob(
  input: Blob,
  opts?: { maxSize?: number; threshold?: number; contrast?: number }
) {
  const maxSize = opts?.maxSize ?? 1800;
  const threshold = opts?.threshold ?? 175;
  const contrast = opts?.contrast ?? 1.25;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(input);
  } catch {
    const url = URL.createObjectURL(input);
    try {
      const img = new Image();
      img.decoding = "async";
      img.src = url;
      await img.decode();

      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, img.naturalWidth || img.width);
      canvas.height = Math.max(1, img.naturalHeight || img.height);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return input;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      bitmap = await createImageBitmap(canvas);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return input;

  ctx.drawImage(bitmap, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;

    let gray = 0.299 * r + 0.587 * g + 0.114 * b;
    gray = (gray - 128) * contrast + 128;
    const bw = gray >= threshold ? 255 : 0;

    data[i] = bw;
    data[i + 1] = bw;
    data[i + 2] = bw;
  }

  ctx.putImageData(imageData, 0, 0);

  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? input), "image/png", 1);
  });
}

async function ocrImage(file: File, onProgress?: (p: number) => void) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("deu+eng", undefined, {
    logger: (m) => {
      if (m?.status === "recognizing text" && typeof m.progress === "number") {
        onProgress?.(m.progress);
      }
    },
  });
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: 6 as any,
      preserve_interword_spaces: "1",
    });

    const attempts: Blob[] = [
      await preprocessImageToBlob(file),
      await preprocessImageToBlob(file, { threshold: 150, contrast: 1.1 }),
      await preprocessImageToBlob(file, { threshold: 200, contrast: 1.35 }),
      file,
    ];

    for (let i = 0; i < attempts.length; i++) {
      const {
        data: { text },
      } = await worker.recognize(attempts[i]);
      const cleaned = (text || "").trim();
      if (cleaned) return cleaned;
    }

    return "";
  } finally {
    await worker.terminate();
  }
}

async function extractPdfText(file: File) {
  const pdfjsLib: any = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  let out = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      .map((it: unknown) => {
        const maybe = it as { str?: unknown };
        return typeof maybe.str === "string" ? maybe.str : "";
      })
      .filter(Boolean);
    out += strings.join(" ") + "\n\n";
  }
  return out.trim();
}

async function ocrPdfScan(
  file: File,
  opts?: { maxPages?: number; scale?: number; onProgress?: (p: number) => void }
) {
  const maxPages = opts?.maxPages ?? 5;
  const scale = opts?.scale ?? 2;

  const pdfjsLib: any = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("deu+eng", undefined, {
    logger: (m) => {
      if (m?.status === "recognizing text" && typeof m.progress === "number") {
        opts?.onProgress?.(m.progress);
      }
    },
  });

  try {
    await worker.setParameters({
      tessedit_pageseg_mode: 6 as any,
      preserve_interword_spaces: "1",
    });

    const data = new Uint8Array(await file.arrayBuffer());
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    const pageCount = Math.min(pdf.numPages, maxPages);

    let out = "";
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) continue;

      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));

      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b ?? new Blob()), "image/png", 1);
      });

      const processed = await preprocessImageToBlob(blob);
      const {
        data: { text },
      } = await worker.recognize(processed);

      const cleaned = (text || "").trim();
      if (cleaned) out += cleaned + "\n\n";

      const overall = pageCount <= 1 ? 1 : pageNum / pageCount;
      opts?.onProgress?.(overall);
    }

    return out.trim();
  } finally {
    await worker.terminate();
  }
}

async function extractTextFromFile(
  file: File,
  onProgress?: (p: number) => void
): Promise<string> {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (type.startsWith("text/") || name.endsWith(".txt")) return readTextFile(file);
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    const extracted = await extractPdfText(file);
    if (extracted.replace(/\s+/g, " ").trim().length >= 80) return extracted;
    const ocr = await ocrPdfScan(file, {
      maxPages: 5,
      scale: 2,
      onProgress,
    });
    return ocr;
  }
  if (type.startsWith("image/") || /\.(png|jpg|jpeg|webp|bmp|tif|tiff)$/i.test(name)) {
    return ocrImage(file, onProgress);
  }

  throw new Error("Dateityp nicht unterstützt. Bitte nutze PDF, TXT oder ein Foto (PNG/JPG).");
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>("Deutsch");
  const [uiLanguage, setUiLanguage] = useState<TargetLanguage>("Deutsch");
  const [sourceText, setSourceText] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [extractProgress, setExtractProgress] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showPremium, setShowPremium] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uiDir = useMemo<"ltr" | "rtl">(() => {
    return LANGUAGES.find((l) => l.value === uiLanguage)?.dir ?? "ltr";
  }, [uiLanguage]);

  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setHasScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const progressPercent = useMemo(() => {
    if (result.trim()) return 100;
    if (isSimplifying) return 75;
    if (isExtracting) {
      const p = extractProgress != null ? Math.max(0, Math.min(1, extractProgress)) : 0;
      return 50 + Math.round(p * 20);
    }
    if (file) return 50;
    if (hasScrolled) return 25;
    return 0;
  }, [extractProgress, file, hasScrolled, isExtracting, isSimplifying, result]);

  const T = useMemo(() => {
    const dict: Record<TargetLanguage, Record<string, string>> = {
      Deutsch: {
        title: "simplify",
        subtitle:
          "Lade ein PDF, eine Textdatei oder ein Foto hoch. Die KI erstellt daraus eine Vereinfachung in einfacher Sprache – ohne wichtige Details oder Fristen auszulassen.",
        privacy: "Datenschutz: Verarbeitung nur in dieser Session",
        types: "PDF · TXT · Foto (OCR)",
        drop: "Datei hier ablegen",
        orPick: "Oder klicke auf „Datei auswählen“.",
        pick: "Datei auswählen",
        noFile: "Keine Datei gewählt",
        analyzing: "Analysiere…",
        language: "Zielsprache",
        simplify: "Vereinfachen",
        simplifying: "Vereinfache…",
        result: "Ergebnis",
        emptyResult: "Noch kein Ergebnis. Lade eine Datei hoch und klicke „Vereinfachen“.",
        hint:
          "Hinweis: Bitte prüfe wichtige Angaben (z.B. Fristen) immer im Originaldokument.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Dokument erkannt",
        freeRemaining: "Kostenlos übrig",
        premiumTitle: "Premium aktivieren",
        premiumDesc: "Unbegrenzt Dokumente vereinfachen für 9,99 € / Monat.",
        premiumBtn: "Premium starten (9,99 €/Monat)",
      },
      Englisch: {
        title: "simplify",
        subtitle:
          "Upload a PDF, text file, or photo. The AI creates a simplified version in plain language without omitting deadlines or important details.",
        privacy: "Privacy: processed only within this session",
        types: "PDF · TXT · Photo (OCR)",
        drop: "Drop your file here",
        orPick: "Or click “Choose file”.",
        pick: "Choose file",
        noFile: "No file selected",
        analyzing: "Analyzing…",
        language: "Target language",
        simplify: "Simplify",
        simplifying: "Simplifying…",
        result: "Result",
        emptyResult: "No result yet. Upload a file and click “Simplify”.",
        hint: "Note: Always verify critical details (e.g. deadlines) in the original document.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Document recognized",
        freeRemaining: "Free remaining",
        premiumTitle: "Activate Premium",
        premiumDesc: "Unlimited documents for €9.99 / month.",
        premiumBtn: "Start Premium (€9.99/month)",
      },
      Türkisch: {
        title: "simplify",
        subtitle:
          "PDF, metin dosyası veya fotoğraf yükle. Yapay zekâ, önemli ayrıntıları ve süreleri atlamadan metni sadeleştirir.",
        privacy: "Gizlilik: yalnızca bu oturumda işlenir",
        types: "PDF · TXT · Fotoğraf (OCR)",
        drop: "Dosyayı buraya bırak",
        orPick: "Veya “Dosya seç”e tıkla.",
        pick: "Dosya seç",
        noFile: "Dosya seçilmedi",
        analyzing: "Analiz ediliyor…",
        language: "Hedef dil",
        simplify: "Sadeleştir",
        simplifying: "Sadeleştiriliyor…",
        result: "Sonuç",
        emptyResult: "Henüz sonuç yok. Dosya yükle ve “Sadeleştir”e tıkla.",
        hint: "Not: Kritik bilgileri (örn. süreleri) mutlaka orijinal belgede kontrol et.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Belge algılandı",
        freeRemaining: "Ücretsiz kalan",
        premiumTitle: "Premium'u etkinleştir",
        premiumDesc: "Aylık 9,99 € ile sınırsız belge.",
        premiumBtn: "Premium'u başlat (9,99 €/ay)",
      },
      Ukrainisch: {
        title: "simplify",
        subtitle:
          "Завантаж PDF, текстовий файл або фото. ШІ спростить текст простою мовою, не пропускаючи важливі деталі та строки.",
        privacy: "Конфіденційність: обробка лише в межах цієї сесії",
        types: "PDF · TXT · Фото (OCR)",
        drop: "Перетягни файл сюди",
        orPick: "Або натисни “Вибрати файл”.",
        pick: "Вибрати файл",
        noFile: "Файл не вибрано",
        analyzing: "Аналіз…",
        language: "Цільова мова",
        simplify: "Спростити",
        simplifying: "Спростення…",
        result: "Результат",
        emptyResult: "Ще немає результату. Завантаж файл і натисни “Спростити”.",
        hint: "Примітка: важливі деталі (напр. строки) завжди перевіряй в оригіналі.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Документ розпізнано",
        freeRemaining: "Залишилось безкоштовно",
        premiumTitle: "Увімкнути Premium",
        premiumDesc: "Необмежено документів за 9,99 € / місяць.",
        premiumBtn: "Почати Premium (9,99 €/міс)",
      },
      Arabisch: {
        title: "simplify",
        subtitle:
          "ارفع ملف PDF أو ملف نصي أو صورة. يقوم الذكاء الاصطناعي بتبسيط النص بلغة واضحة دون حذف المواعيد النهائية أو التفاصيل المهمة.",
        privacy: "الخصوصية: تتم المعالجة ضمن هذه الجلسة فقط",
        types: "PDF · TXT · صورة (OCR)",
        drop: "اسحب الملف هنا",
        orPick: "أو اضغط “اختر ملفًا”.",
        pick: "اختر ملفًا",
        noFile: "لم يتم اختيار ملف",
        analyzing: "جارٍ التحليل…",
        language: "اللغة المستهدفة",
        simplify: "تبسيط",
        simplifying: "جارٍ التبسيط…",
        result: "النتيجة",
        emptyResult: "لا توجد نتيجة بعد. ارفع ملفًا ثم اضغط “تبسيط”.",
        hint: "ملاحظة: تحقّق دائمًا من التفاصيل المهمة (مثل المواعيد) في المستند الأصلي.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "تم التعرف على المستند",
        freeRemaining: "المتبقي مجانًا",
        premiumTitle: "تفعيل Premium",
        premiumDesc: "مستندات غير محدودة مقابل 9.99€ شهريًا.",
        premiumBtn: "ابدأ Premium (9.99€/شهر)",
      },
      Polnisch: {
        title: "simplify",
        subtitle:
          "Prześlij PDF, plik tekstowy lub zdjęcie. AI uprości tekst prostym językiem bez pomijania terminów i ważnych szczegółów.",
        privacy: "Prywatność: przetwarzanie tylko w tej sesji",
        types: "PDF · TXT · Zdjęcie (OCR)",
        drop: "Upuść plik tutaj",
        orPick: "Albo kliknij “Wybierz plik”.",
        pick: "Wybierz plik",
        noFile: "Nie wybrano pliku",
        analyzing: "Analiza…",
        language: "Język docelowy",
        simplify: "Uprość",
        simplifying: "Upraszczanie…",
        result: "Wynik",
        emptyResult: "Brak wyniku. Prześlij plik i kliknij “Uprość”.",
        hint: "Uwaga: ważne szczegóły (np. terminy) zawsze sprawdzaj w oryginale.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Rozpoznano dokument",
        freeRemaining: "Pozostało za darmo",
        premiumTitle: "Aktywuj Premium",
        premiumDesc: "Nielimitowane dokumenty za 9,99 € / miesiąc.",
        premiumBtn: "Start Premium (9,99 €/mies.)",
      },
      Russisch: {
        title: "simplify",
        subtitle:
          "Загрузите PDF, текстовый файл или фото. ИИ упростит текст простым языком, не пропуская важные детали и сроки.",
        privacy: "Конфиденциальность: обработка только в рамках этой сессии",
        types: "PDF · TXT · Фото (OCR)",
        drop: "Перетащите файл сюда",
        orPick: "Или нажмите “Выбрать файл”.",
        pick: "Выбрать файл",
        noFile: "Файл не выбран",
        analyzing: "Анализ…",
        language: "Целевой язык",
        simplify: "Упростить",
        simplifying: "Упрощение…",
        result: "Результат",
        emptyResult: "Результата пока нет. Загрузите файл и нажмите “Упростить”.",
        hint: "Примечание: важные детали (например, сроки) всегда проверяйте в оригинале.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Документ распознан",
        freeRemaining: "Бесплатно осталось",
        premiumTitle: "Включить Premium",
        premiumDesc: "Безлимитные документы за 9,99 € / месяц.",
        premiumBtn: "Начать Premium (9,99 €/мес)",
      },
      Serbokroatisch: {
        title: "simplify",
        subtitle:
          "Otpremi PDF, tekstualnu datoteku ili fotografiju. AI pojednostavljuje tekst jasnim jezikom bez izostavljanja rokova i važnih detalja.",
        privacy: "Privatnost: obrada samo u okviru ove sesije",
        types: "PDF · TXT · Fotografija (OCR)",
        drop: "Prevuci fajl ovde",
        orPick: "Ili klikni “Izaberi fajl”.",
        pick: "Izaberi fajl",
        noFile: "Nema izabranog fajla",
        analyzing: "Analiza…",
        language: "Ciljni jezik",
        simplify: "Pojednostavi",
        simplifying: "Pojednostavljivanje…",
        result: "Rezultat",
        emptyResult: "Još nema rezultata. Otpremi fajl i klikni “Pojednostavi”.",
        hint: "Napomena: važne detalje (npr. rokove) uvek proveri u originalu.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Dokument prepoznat",
        freeRemaining: "Besplatno preostalo",
        premiumTitle: "Aktiviraj Premium",
        premiumDesc: "Neograničeno dokumenata za 9,99 € / mesečno.",
        premiumBtn: "Pokreni Premium (9,99 €/mes)",
      },
      Rumänisch: {
        title: "simplify",
        subtitle:
          "Încarcă un PDF, un fișier text sau o fotografie. AI simplifică textul în limbaj clar, fără a omite termene sau detalii importante.",
        privacy: "Confidențialitate: procesare doar în această sesiune",
        types: "PDF · TXT · Fotografie (OCR)",
        drop: "Lasă fișierul aici",
        orPick: "Sau apasă “Alege fișier”.",
        pick: "Alege fișier",
        noFile: "Niciun fișier selectat",
        analyzing: "Se analizează…",
        language: "Limba țintă",
        simplify: "Simplifică",
        simplifying: "Se simplifică…",
        result: "Rezultat",
        emptyResult: "Încă nu există rezultat. Încarcă un fișier și apasă “Simplifică”.",
        hint: "Notă: verifică mereu detaliile importante (ex. termenele) în documentul original.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Document recunoscut",
        freeRemaining: "Gratuit rămas",
        premiumTitle: "Activează Premium",
        premiumDesc: "Documente nelimitate pentru 9,99 € / lună.",
        premiumBtn: "Pornește Premium (9,99 €/lună)",
      },
      Italienisch: {
        title: "simplify",
        subtitle:
          "Carica un PDF, un file di testo o una foto. L'IA semplifica il testo in linguaggio chiaro senza omettere scadenze o dettagli importanti.",
        privacy: "Privacy: elaborazione solo in questa sessione",
        types: "PDF · TXT · Foto (OCR)",
        drop: "Trascina qui il file",
        orPick: "Oppure clicca “Scegli file”.",
        pick: "Scegli file",
        noFile: "Nessun file selezionato",
        analyzing: "Analisi…",
        language: "Lingua di destinazione",
        simplify: "Semplifica",
        simplifying: "Semplificazione…",
        result: "Risultato",
        emptyResult: "Nessun risultato. Carica un file e clicca “Semplifica”.",
        hint: "Nota: verifica sempre i dettagli importanti (es. scadenze) nel documento originale.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Documento riconosciuto",
        freeRemaining: "Gratis rimasti",
        premiumTitle: "Attiva Premium",
        premiumDesc: "Documenti illimitati per 9,99 € / mese.",
        premiumBtn: "Avvia Premium (9,99 €/mese)",
      },
      Spanisch: {
        title: "simplify",
        subtitle:
          "Sube un PDF, un archivo de texto o una foto. La IA simplifica el texto en lenguaje claro sin omitir plazos ni detalles importantes.",
        privacy: "Privacidad: procesamiento solo en esta sesión",
        types: "PDF · TXT · Foto (OCR)",
        drop: "Suelta el archivo aquí",
        orPick: "O haz clic en “Elegir archivo”.",
        pick: "Elegir archivo",
        noFile: "Ningún archivo seleccionado",
        analyzing: "Analizando…",
        language: "Idioma de destino",
        simplify: "Simplificar",
        simplifying: "Simplificando…",
        result: "Resultado",
        emptyResult: "Aún no hay resultado. Sube un archivo y haz clic en “Simplificar”.",
        hint: "Nota: verifica siempre los detalles importantes (p. ej., plazos) en el documento original.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Documento reconocido",
        freeRemaining: "Gratis restantes",
        premiumTitle: "Activar Premium",
        premiumDesc: "Documentos ilimitados por 9,99 € / mes.",
        premiumBtn: "Iniciar Premium (9,99 €/mes)",
      },
      Französisch: {
        title: "simplify",
        subtitle:
          "Téléverse un PDF, un fichier texte ou une photo. L'IA simplifie le texte en langage clair sans omettre les délais ni les informations importantes.",
        privacy: "Confidentialité : traitement uniquement dans cette session",
        types: "PDF · TXT · Photo (OCR)",
        drop: "Dépose le fichier ici",
        orPick: "Ou clique sur “Choisir un fichier”.",
        pick: "Choisir un fichier",
        noFile: "Aucun fichier sélectionné",
        analyzing: "Analyse…",
        language: "Langue cible",
        simplify: "Simplifier",
        simplifying: "Simplification…",
        result: "Résultat",
        emptyResult: "Pas encore de résultat. Téléverse un fichier et clique sur “Simplifier”.",
        hint: "Remarque : vérifie toujours les détails importants (p. ex. délais) dans le document original.",
        reset: "Zurück zu Deutsch / Back to German",
        ready: "Document reconnu",
        freeRemaining: "Gratuit restant",
        premiumTitle: "Activer Premium",
        premiumDesc: "Documents illimités pour 9,99 € / mois.",
        premiumBtn: "Démarrer Premium (9,99 €/mois)",
      },
    };

    return dict[uiLanguage];
  }, [uiLanguage]);

  async function refreshUsage() {
    try {
      const res = await fetch("/api/usage", { cache: "no-store" });
      const data = (await res.json()) as { premium?: boolean; remaining?: number | null };
      setIsPremium(Boolean(data.premium));
      setRemaining(typeof data.remaining === "number" ? data.remaining : null);
    } catch {
      setIsPremium(false);
      setRemaining(null);
    }
  }

  useEffect(() => {
    void refreshUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSimplify = useMemo(() => {
    return !isExtracting && !isSimplifying && (sourceText.trim().length > 0 || !!file);
  }, [file, isExtracting, isSimplifying, sourceText]);

  async function handlePickFile(next: File | null) {
    setError("");
    setResult("");
    setShowPremium(false);
    setFile(next);
    setSourceText("");
    setExtractProgress(null);

    if (!next) return;
    setIsExtracting(true);
    try {
      const text = await extractTextFromFile(next, (p) => setExtractProgress(p));
      const cleaned = text.replace(/\s+\n/g, "\n").trim();
      if (!cleaned) {
        throw new Error(
          "Kein Text erkannt. Tipp: Foto gerade ausrichten, näher ran, gutes Licht. Bei gescannten PDFs funktioniert OCR nur bei gut lesbarer Qualität (wir analysieren die ersten 5 Seiten)."
        );
      }
      setSourceText(cleaned);
      void refreshUsage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Lesen der Datei.");
    } finally {
      setIsExtracting(false);
      setExtractProgress(null);
    }
  }

  async function onSimplify() {
    setError("");
    setResult("");
    setShowPremium(false);
    setIsSimplifying(true);
    try {
      const res = await fetch("/api/simplify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sourceText, targetLanguage }),
      });

      const data = (await res.json()) as { simplifiedText?: string; error?: string };
      if (res.status === 402) {
        setShowPremium(true);
        void refreshUsage();
        throw new Error(data.error || "Premium erforderlich.");
      }
      if (!res.ok) throw new Error(data.error || "Fehler beim Vereinfachen.");
      setResult((data.simplifiedText || "").trim());
      void refreshUsage();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unerwarteter Fehler.");
    } finally {
      setIsSimplifying(false);
    }
  }

  async function startPremium() {
    setError("");
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Checkout konnte nicht gestartet werden.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unerwarteter Fehler.");
    }
  }

  return (
    <div className="min-h-screen bg-app-bg text-foreground" dir={uiDir}>
      <a className="kk-skip-link" href="#main">
        Zum Inhalt
      </a>

      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-gov-accent/12 blur-3xl" />
        <div className="absolute -bottom-32 left-10 h-[360px] w-[360px] rounded-full bg-gov-brown/8 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-12">
        <header className="mb-0">
          <div className="px-1 py-2 text-center sm:px-2">
            <div className="flex items-center justify-center gap-3">
              <h1
                className="relative z-0 inline-block font-display text-5xl font-semibold tracking-tight sm:text-7xl"
                style={{
                  fontFamily: '"StretchPro", var(--font-display), ui-sans-serif, system-ui',
                  color: "#5B3A29",
                  letterSpacing: "0.08em",
                  opacity: 1,
                  textShadow:
                    "0 1px 0 rgba(255,255,255,0.12), 0 10px 22px rgba(0,0,0,0.18)",
                }}
              >
                {T.title}
              </h1>
            </div>
            <p className="relative z-20 mx-auto mt-3 max-w-2xl text-sm leading-6 text-gov-brown sm:mt-4">
              {T.subtitle}
            </p>
            <div className="mt-3 inline-flex rounded-full border border-border-subtle/30 bg-white/20 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-sm">
              {T.privacy}
            </div>
          </div>
        </header>

        {progressPercent > 0 && (
          <div className="sticky top-3 z-10 mt-4">
            <div className="-mx-5 rounded-2xl bg-app-bg/70 px-5 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
              <div
                className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/70 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
                aria-valuetext={`${progressPercent}%`}
              >
                <div
                  className="relative h-1.5 rounded-full bg-gov-blue motion-safe:transition-[width] motion-safe:duration-700 motion-safe:ease-out"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 h-5 w-8 -translate-y-1/2 bg-gov-blue/25 blur-md" />
                </div>
              </div>
            </div>
          </div>
        )}

        <section aria-label="Status" className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border-subtle/30 bg-white/65 px-5 py-4 shadow-lg backdrop-blur-sm">
            <div className="text-xs font-semibold text-gov-brown">{isPremium ? "Premium" : T.freeRemaining}</div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              {isPremium ? "Aktiv" : remaining != null ? remaining : "—"}
            </div>
          </div>
          <div className="rounded-2xl border border-border-subtle/30 bg-white/65 px-5 py-4 shadow-lg backdrop-blur-sm">
            <div className="text-xs font-semibold text-gov-brown">{T.language}</div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-foreground">
              {LANGUAGES.find((l) => l.value === targetLanguage)?.label ?? targetLanguage}
            </div>
          </div>
          <div className="rounded-2xl border border-border-subtle/30 bg-white/65 px-5 py-4 shadow-lg backdrop-blur-sm">
            <div className="text-xs font-semibold text-gov-brown">Privacy</div>
            <div className="mt-1 text-lg font-semibold tracking-tight text-foreground">Session only</div>
          </div>
        </section>

        <main id="main" className="mt-6 grid gap-6">
          <section
            className={
              "rounded-3xl border border-border-subtle/30 bg-white/65 p-6 shadow-xl backdrop-blur-sm transition-all duration-200 sm:p-8 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-2xl " +
              (isDragging
                ? "border-gov-blue/60 ring-4 ring-gov-blue/10"
                : "hover:border-gov-blue/40")
            }
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              const dropped = e.dataTransfer.files?.[0];
              void handlePickFile(dropped ?? null);
            }}
          >
            <div className="flex flex-col gap-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{T.drop}</h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gov-brown">{T.orPick}</p>
                </div>
                <div className="hidden sm:block">
                  <div className="rounded-full border border-border-subtle bg-app-bg px-3 py-1 text-xs text-gov-brown">
                    {T.types}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
                <input
                  id="kk-file"
                  type="file"
                  className="sr-only"
                  accept="application/pdf,.pdf,text/plain,.txt,image/*"
                  aria-describedby="kk-file-help kk-file-name"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.currentTarget.files?.[0] ?? null;
                    if (!f) {
                      setError(
                        "Keine Datei übernommen. Tipp: Öffne das PDF in der Dateien-App und teile es erneut oder speichere es lokal (nicht nur Vorschau/iCloud)."
                      );
                      e.currentTarget.value = "";
                      return;
                    }
                    void handlePickFile(f);
                    e.currentTarget.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-gov-blue px-5 text-sm font-semibold text-white shadow-lg shadow-gov-blue/20 transition-all duration-200 hover:bg-gov-blue/90 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-xl active:translate-y-px"
                >
                  {T.pick}
                </button>

                <div id="kk-file-name" className="text-xs text-gov-brown" aria-live="polite">
                  {file ? (
                    <span>
                      {file.name} · {formatBytes(file.size)}
                    </span>
                  ) : (
                    <span>{T.noFile}</span>
                  )}
                </div>
              </div>

              <div id="kk-file-help" className="sr-only">
                {T.types}
              </div>

              {(isExtracting || sourceText) && (
                <div
                  className="mt-1 flex items-center gap-3 rounded-xl border border-border-subtle bg-app-bg px-4 py-3 text-sm text-gov-brown"
                  role="status"
                  aria-live="polite"
                >
                  <div className="h-2 w-2 rounded-full bg-gov-accent motion-safe:animate-pulse" />
                  <div className="flex-1">
                    {isExtracting
                      ? extractProgress != null
                        ? `${T.analyzing} ${Math.round(extractProgress * 100)}%`
                        : T.analyzing
                      : T.ready}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-4 rounded-3xl border border-border-subtle/30 bg-white/65 p-6 shadow-xl backdrop-blur-sm transition-all duration-200 sm:p-8 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-2xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-foreground">{T.language}</h2>
              <div className="text-xs font-medium text-gov-brown">
                {isPremium
                  ? "Premium"
                  : remaining != null
                    ? `${T.freeRemaining}: ${remaining}`
                    : ""}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
              <label className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-gov-brown">{T.language}</span>
                  <button
                    type="button"
                    className="inline-flex h-8 items-center justify-center rounded-full border border-border-subtle/30 bg-white/55 px-3 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white/70 hover:shadow-md motion-safe:hover:-translate-y-0.5 active:translate-y-px"
                    onClick={() => {
                      setUiLanguage("Deutsch");
                      setTargetLanguage("Deutsch");
                    }}
                  >
                    {T.reset}
                  </button>
                </div>
                <select
                  value={targetLanguage}
                  onChange={(e) => {
                    const v = e.target.value as TargetLanguage;
                    setTargetLanguage(v);
                    setUiLanguage(v);
                  }}
                  className="h-11 w-full rounded-xl border border-border-subtle bg-white px-3 text-sm text-foreground shadow-sm outline-none transition focus:border-gov-accent/60 focus:ring-4 focus:ring-gov-accent/20"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                disabled={!canSimplify}
                onClick={() => void onSimplify()}
                className={
                  "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold shadow-lg transition-all duration-200 active:translate-y-px " +
                  (canSimplify
                    ? "bg-gov-blue text-white hover:bg-gov-blue/90 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-xl"
                    : "cursor-not-allowed bg-surface-2 text-gov-brown/70 shadow-sm")
                }
              >
                {isSimplifying ? T.simplifying : T.simplify}
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {error}
              </div>
            )}

            {showPremium && (
              <div className="rounded-2xl border border-border-subtle/30 bg-white/65 p-5 shadow-sm backdrop-blur-sm">
                <div className="text-sm font-semibold text-foreground">{T.premiumTitle}</div>
                <div className="mt-1 text-sm leading-6 text-gov-brown">{T.premiumDesc}</div>
                <button
                  type="button"
                  onClick={() => void startPremium()}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-gov-blue px-5 text-sm font-semibold text-white shadow-lg shadow-gov-blue/20 transition-all duration-200 hover:bg-gov-blue/90 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-xl active:translate-y-px"
                >
                  {T.premiumBtn}
                </button>
              </div>
            )}

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">{T.result}</h2>
                <div className="text-xs text-gov-brown">{DISCLAIMER}</div>
              </div>
              <div className="min-h-[180px] whitespace-pre-wrap rounded-xl border border-border-subtle bg-white px-4 py-3 text-sm leading-6 text-foreground shadow-sm">
                {result ? result : <span className="text-gov-brown/70">{T.emptyResult}</span>}
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-10 text-xs leading-6 text-gov-brown">
          <p>
            {T.hint} {DISCLAIMER}
          </p>
        </footer>
      </div>
    </div>
  );
}
