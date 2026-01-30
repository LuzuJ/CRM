import { useState } from 'react';
import PropTypes from 'prop-types';
import { documentService } from '../services';
import { createWorker } from 'tesseract.js';

const DocumentViewer = ({ document, onClose, onOCR }) => {
  const [loading, setLoading] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(0);

  const handleDownload = async () => {
    try {
      const blob = await documentService.downloadFile(document.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.name || 'documento.pdf';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar:', error);
      alert('Error al descargar el archivo');
    }
  };

  const handleExtractOCR = async () => {
    try {
      setLoading(true);
      setOcrProgress(0);
      
      // Crear worker de Tesseract.js
      const worker = await createWorker('spa', 1, {
        logger: (m) => {
          // Actualizar progreso
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });

      // Obtener la imagen del documento
      const imageUrl = documentService.getViewUrl(document.id);
      
      // Realizar OCR con Tesseract.js
      const { data: { text, confidence } } = await worker.recognize(imageUrl);
      
      // Terminar worker
      await worker.terminate();
      
      // Procesar el texto extraído según el tipo de documento
      const extractedData = parseOCRText(text, document.tipo_documento);
      
      // Enviar al backend para guardar
      const result = await documentService.saveOCRData(document.id, {
        datos_extraidos: extractedData,
        nivel_confianza: confidence / 100,
        texto_completo: text
      });
      
      setOcrData(extractedData);
      if (onOCR) onOCR({ datos_extraidos: extractedData, nivel_confianza: confidence / 100 });
    } catch (error) {
      console.error('Error al extraer datos OCR:', error);
      alert(error.message || 'Error al procesar OCR');
    } finally {
      setLoading(false);
      setOcrProgress(0);
    }
  };

  // Función auxiliar para parsear texto OCR según tipo de documento
  const parseOCRText = (text, tipoDoc) => {
    const data = { texto_completo: text };
    
    // Expresiones regulares para extraer datos comunes
    const patterns = {
      fecha: /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g,
      numero: /\b([A-Z0-9]{6,15})\b/g,
      nombre: /(?:nombre[s]?|apellido[s]?)[:\s]+([A-ZÀ-ÿ\s]+)/gi,
    };

    // Extraer datos según patrón
    const fechas = text.match(patterns.fecha) || [];
    const numeros = text.match(patterns.numero) || [];
    const nombres = text.match(patterns.nombre) || [];

    // Asignar datos según tipo de documento
    if (tipoDoc === 'PASAPORTE' || tipoDoc === 'CEDULA') {
      if (numeros.length > 0) data.numero_documento = numeros[0];
      if (nombres.length > 0) data.nombres = nombres[0].split(':')[1]?.trim();
      if (fechas.length > 0) data.fecha_nacimiento = fechas[0];
      if (fechas.length > 1) data.fecha_expiracion = fechas[1];
    } else if (tipoDoc === 'VISA') {
      if (numeros.length > 0) data.numero_visa = numeros[0];
      if (fechas.length > 0) data.fecha_inicio = fechas[0];
      if (fechas.length > 1) data.fecha_expiracion = fechas[1];
    }
    
    return data;
  };

  const viewUrl = documentService.getViewUrl(document.id);
  const isImage = document.name && /\.(jpg|jpeg|png|gif|bmp)$/i.test(document.name);
  const isPDF = document.name && /\.pdf$/i.test(document.name);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{document.name}</h2>
            <p className="text-sm text-slate-500">
              {document.id} • {document.tipo_documento || document.type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExtractOCR}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span>
              {loading ? `Procesando... ${ocrProgress}%` : 'Extraer Datos OCR'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Descargar
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-6 h-full">
            {/* Document Viewer */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
              {isImage ? (
                <img 
                  src={viewUrl} 
                  alt={document.name}
                  className="w-full h-full object-contain"
                />
              ) : isPDF ? (
                <iframe
                  src={viewUrl}
                  title={document.name}
                  className="w-full h-full min-h-[500px]"
                />
              ) : (
                <div className="flex items-center justify-center h-full min-h-[500px] text-slate-500">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-[64px] text-slate-300">description</span>
                    <p className="mt-4">Vista previa no disponible para este tipo de archivo</p>
                    <p className="text-sm mt-2">Usa el botón &quot;Descargar&quot; para ver el archivo</p>
                  </div>
                </div>
              )}
            </div>

            {/* OCR Data Panel */}
            <div className="bg-white rounded-lg shadow-sm p-4 overflow-auto">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
                Datos Extraídos (OCR)
              </h3>

              {ocrData ? (
                <div className="space-y-3">
                  {Object.entries(ocrData).map(([key, value]) => (
                    <div key={key} className="border-b border-slate-100 pb-2">
                      <p className="text-xs font-medium text-slate-500 uppercase">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-slate-900 mt-1 font-medium">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="material-symbols-outlined text-[48px] text-slate-300">
                    text_fields
                  </span>
                  <p className="text-sm text-slate-500 mt-2">
                    Haz clic en &quot;Extraer Datos OCR&quot; para procesar el documento
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

DocumentViewer.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    tipo_documento: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onOCR: PropTypes.func,
};

export default DocumentViewer;
