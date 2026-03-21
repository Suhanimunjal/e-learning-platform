'use client';

import { useState, useEffect } from 'react';
import { 
  Languages, 
  Loader2, 
  X, 
  Copy, 
  Check, 
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Eye
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface TranslationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  contentType?: 'lesson' | 'assignment' | 'quiz';
  contentId?: string;
  onApply?: (translatedContent: string, targetLang: string) => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
];

const SAMPLE_CONTENT = `## Introduction to JavaScript

JavaScript is a programming language that allows you to implement complex features on web pages. Every time a web page does more than just sit there and display static information for you to look at — like displaying timely content updates, interactive maps, animated 2D/3D graphics, scrolling video jukeboxes, etc. — you can bet that JavaScript is probably involved.

### Variables

Variables are containers for storing data values. In JavaScript, you can declare variables using \`var\`, \`let\`, or \`const\`.

### Functions

Functions are one of the fundamental building blocks in JavaScript. A function is a JavaScript procedure — a set of statements that performs a task or calculates a value.

### Arrays

Arrays are used to store multiple values in a single variable. They are useful when you need to work with a collection of related values.

### Conclusion

JavaScript is an essential skill for any web developer. It allows you to create dynamic and interactive web applications that provide a rich user experience.`;

const MOCK_TRANSLATIONS: Record<string, string> = {
  es: `## Introducción a JavaScript

JavaScript es un lenguaje de programación que te permite implementar características complejas en páginas web. Cada vez que una página web hace algo más que simplemente estar ahí y mostrarte información estática para que la mires — como mostrar actualizaciones de contenido oportunas, mapas interactivos, gráficos 2D/3D animados, jukeboxes de video con desplazamiento, etc. — puedes apostar que JavaScript probablemente está involucrado.

### Variables

Las variables son contenedores para almacenar valores de datos. En JavaScript, puedes declarar variables usando \`var\`, \`let\`, o \`const\`.

### Funciones

Las funciones son uno de los bloques de construcción fundamentales en JavaScript. Una función es un procedimiento de JavaScript — un conjunto de declaraciones que realiza una tarea o calcula un valor.

### Arrays

Los arrays se utilizan para almacenar múltiples valores en una sola variable. Son útiles cuando necesitas trabajar con una colección de valores relacionados.

### Conclusión

JavaScript es una habilidad esencial para cualquier desarrollador web. Te permite crear aplicaciones web dinámicas e interactivas que proporcionan una rica experiencia de usuario.`,
  
  fr: `## Introduction à JavaScript

JavaScript est un langage de programmation qui vous permet de mettre en œuvre des fonctionnalités complexes sur les pages web. Chaque fois qu'une page web fait plus que simplement rester là et vous montrer des informations statiques — comme afficher des mises à jour de contenu en temps opportun, des cartes interactives, des graphiques 2D/3D animés, des jukeboxes vidéo défileants, etc. — vous pouvez être sûr que JavaScript est probablement impliqué.

### Variables

Les variables sont des conteneurs pour stocker des valeurs de données. En JavaScript, vous pouvez déclarer des variables en utilisant \`var\`, \`let\`, ou \`const\`.

### Fonctions

Les fonctions sont l'un des éléments fondamentaux de JavaScript. Une fonction est une procédure JavaScript — un ensemble d'instructions qui effectue une tâche ou calcule une valeur.

### Tableaux

Les tableaux sont utilisés pour stocker plusieurs valeurs dans une seule variable. Ils sont utiles lorsque vous devez travailler avec une collection de valeurs apparentées.

### Conclusion

JavaScript est une compétence essentielle pour tout développeur web. Il vous permet de créer des applications web dynamiques et interactives qui offrent une expérience utilisateur riche.`,
  
  de: `## Einführung in JavaScript

JavaScript ist eine Programmiersprache, mit der Sie komplexe Funktionen auf Webseiten implementieren können. Jedes Mal, wenn eine Webseite mehr tut, als nur dort zu sitzen und statische Informationen anzuzeigen — wie das Anzeigen zeitnaher Inhaltsaktualisierungen, interaktiver Karten, animierter 2D/3D-Grafiken, scrollender Video-Jukeboxen usw. — können Sie davon ausgehen, dass JavaScript wahrscheinlich beteiligt ist.

### Variablen

Variablen sind Behälter zum Speichern von Datenwerten. In JavaScript können Sie Variablen mit \`var\`, \`let\` oder \`const\` deklarieren.

### Funktionen

Funktionen sind eines der fundamentalen Bausteine in JavaScript. Eine Funktion ist eine JavaScript-Prozedur — eine Reihe von Anweisungen, die eine Aufgabe ausführt oder einen Wert berechnet.

### Arrays

Arrays werden verwendet, um mehrere Werte in einer einzigen Variable zu speichern. Sie sind nützlich, wenn Sie mit einer Sammlung verwandter Werte arbeiten müssen.

### Fazit

JavaScript ist eine wesentliche Fähigkeit für jeden Webentwickler. Es ermöglicht Ihnen, dynamische und interaktive Web-Anwendungen zu erstellen, die ein reichhaltiges Benutzererlebnis bieten.`,
  
  zh: `## JavaScript 简介

JavaScript 是一种编程语言，允许您在网页上实现复杂的功能。每当网页不仅仅是静态显示信息供您查看时——比如显示及时的内容更新、交互式地图、动画2D/3D图形、滚动视频点唱机等——您可以确信JavaScript可能参与其中。

### 变量

变量是存储数据值的容器。在JavaScript中，您可以使用 \`var\`、\`let\` 或 \`const\` 声明变量。

### 函数

函数是JavaScript的基本构建块之一。函数是一个JavaScript过程——执行任务或计算值的一组语句。

### 数组

数组用于在单个变量中存储多个值。当您需要处理一组相关值时，它们很有用。

### 结论

JavaScript是任何Web开发人员的基本技能。它允许您创建提供丰富用户体验的动态和交互式Web应用程序。`,
  
  ja: `## JavaScriptの概要

JavaScriptは、Webページに複雑な機能を実装できるプログラミング言語です。タイムリーなコンテンツの更新、インタラクティブなマップ、アニメーション化された2D/3Dグラフィック、スクロールするビデオジュークボックスなどを表示するたびに、JavaScriptが関与している可能性があります。

### 変数

変数は、データ値を格納するためのコンテナです。JavaScriptでは、\`var\`、\`let\`、または \`const\` を使用して変数を宣言できます。

### 関数

関数は、JavaScriptの基本的なビルディングブロックの1つです。関数は、JavaScriptプロシージャ—タスクを実行または値を計算する一連のステートメントです。

### 配列

配列は、複数の値を1つの変数に格納するために使用されます。関連する値のコレクションを操作する必要がある場合に便利です。

### 結論

JavaScriptは、すべてのWeb開発者にとって不可欠なスキルです。豊かなユーザーエクスペリエンスを提供する動的でインタラクティブなWebアプリケーションを作成できます。`,
  
  hi: `## जावास्क्रिप्ट का परिचय

जावास्क्रिप्ट एक प्रोग्रामिंग भाषा है जो आपको वेब पेजों पर जटिल सुविधाएं लागू करने की अनुमति देती है। हर बार जब कोई वेब पेज केवल स्थिर जानकारी दिखाने के लिए बैठता है और आपको देखता है — जैसे समय पर सामग्री अपडेट, इंटरैक्टिव मानचित्र, एनिमेटेड 2D/3D ग्राफिक्स, स्क्रॉलिंग वीडियो ज्यूकबॉक्स आदि प्रदर्शित करना — आप बता सकते हैं कि जावास्क्रिप्ट संभवतः शामिल है।

### वेरिएबल्स

वेरिएबल्स डेटा वैल्यू स्टोर करने के कंटेनर हैं। जावास्क्रिप्ट में, आप \`var\`, \`let\`, या \`const\` का उपयोग करके वेरिएबल्स घोषित कर सकते हैं।

### फंक्शन्स

फंक्शन्स जावास्क्रिप्ट में मूल बिल्डिंग ब्लॉक में से एक हैं। एक फंक्शन एक जावास्क्रिप्ट प्रोसीजर है — एक सेट ऑफ स्टेटमेंट जो एक टास्क करता है या एक वैल्यू की गणना करता है।

### Arrays

Arrays का उपयोग एक ही वेरिएबल में कई वैल्यू स्टोर करने के लिए किया जाता है। वे तब उपयोगी होते हैं जब आपको संबंधित वैल्यू के संग्रह के साथ काम करना होता है।

### निष्कर्ष

जावास्क्रिप्ट किसी भी वेब डेवलपर के लिए एक आवश्यक कौशल है। यह आपको उत्कृष्ट उपयोगकर्ता अनुभव प्रदान करने वाले गतिशील और इंटरैक्टिव वेब एप्लिकेशन बनाने की अनुमति देता है।`
};

export default function TranslationModal({ 
  isOpen, 
  onClose, 
  initialContent = SAMPLE_CONTENT,
  onApply 
}: TranslationModalProps) {
  const [sourceText, setSourceText] = useState(initialContent);
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('English (detected)');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSourceText(initialContent);
      setTranslatedText('');
      setError(null);
    }
  }, [isOpen, initialContent]);

  const handleDetectLanguage = async () => {
    setIsDetecting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDetectedLanguage('English (detected)');
    setIsDetecting(false);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setError(null);
    setIsTranslating(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use mock translation
      const translation = MOCK_TRANSLATIONS[selectedLanguage.code] || 
        `Translation to ${selectedLanguage.name} would appear here...`;
      
      setTranslatedText(translation);
      setShowPreview(true);
    } catch (err) {
      setError('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApply) {
      onApply(translatedText, selectedLanguage.code);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center">
              <Languages className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Translation</h3>
              <p className="text-sm text-gray-500">Translate your content to multiple languages</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Text */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Source Text</label>
                <button 
                  onClick={handleDetectLanguage}
                  disabled={isDetecting}
                  className="text-sm text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                >
                  {isDetecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Detect Language
                    </>
                  )}
                </button>
              </div>
              <div className="text-xs text-gray-500 mb-2">{detectedLanguage}</div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="w-full h-80 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none font-mono text-sm"
                placeholder="Enter text to translate..."
              />
              <div className="text-xs text-gray-500">
                {sourceText.length} characters • ~{Math.ceil(sourceText.split(/\s+/).length / 200)} min read
              </div>
            </div>

            {/* Translated Text */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Translation</label>
                <button 
                  onClick={() => setShowPreview(false)}
                  className={`text-sm ${showPreview ? 'text-cyan-600 hover:text-cyan-700' : 'text-gray-400 cursor-not-allowed'}`}
                  disabled={!showPreview}
                >
                  <Eye className="h-4 w-4 inline mr-1" />
                  Preview Mode
                </button>
              </div>
              <div className="h-11 flex items-center">
                <select
                  value={selectedLanguage.code}
                  onChange={(e) => setSelectedLanguage(LANGUAGES.find(l => l.code === e.target.value) || LANGUAGES[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>
              
              {showPreview ? (
                <div className="relative">
                  <textarea
                    value={translatedText}
                    onChange={(e) => setTranslatedText(e.target.value)}
                    className="w-full h-80 px-4 py-3 border border-cyan-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 resize-none font-mono text-sm bg-cyan-50"
                    placeholder="Translation will appear here..."
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-500" />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-80 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-400">
                    <Languages className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Click translate to see the result</p>
                  </div>
                </div>
              )}
              
              {translatedText && (
                <div className="text-xs text-gray-500">
                  {translatedText.length} characters
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-start gap-2 p-4 bg-red-50 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Popular Languages */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Popular Languages</h4>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.slice(0, 8).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    selectedLanguage.code === lang.code
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
            >
              {isTranslating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="mr-2 h-4 w-4" />
                  Translate
                </>
              )}
            </Button>
            <Button 
              onClick={handleApply}
              disabled={!translatedText}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Apply Translation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
