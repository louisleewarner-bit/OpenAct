/** Parcel's data-url: imports (fonts embedded in the PDF exporter). */
declare module 'data-url:*' {
  const url: string;
  export default url;
}
declare module 'jspdf/dist/jspdf.umd.min.js' {
  export { jsPDF } from 'jspdf';
}
