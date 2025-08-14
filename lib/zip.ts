import JSZip from 'jszip'
import { GeneratedFiles } from './validation'

export async function zipFiles(files: GeneratedFiles['files']): Promise<Buffer> {
  const zip = new JSZip()
  
  files.forEach(file => {
    zip.file(file.path, file.content)
  })
  
  const buffer = await zip.generateAsync({ 
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  })
  
  return buffer as Buffer
}