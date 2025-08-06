import LZString from 'lz-string';
import { nanoid } from 'nanoid';
import { AmericanoSession } from '@/types';

export function exportSessionToUrl(session: AmericanoSession): string {
  try {
    const sessionJson = JSON.stringify(session);
    const compressedData = LZString.compressToEncodedURIComponent(sessionJson);
    return `${window.location.origin}/#${compressedData}`;
  } catch (error) {
    console.error('Failed to export session:', error);
    throw new Error('Failed to create share URL');
  }
}

export function importSessionFromUrl(): AmericanoSession | null {
  try {
    const urlFragment = window.location.hash.slice(1);
    if (!urlFragment) return null;
    
    const decompressedData = LZString.decompressFromEncodedURIComponent(urlFragment);
    if (!decompressedData) return null;
    
    const sessionData = JSON.parse(decompressedData) as AmericanoSession;
    
    return {
      ...sessionData,
      sessionId: nanoid(),
      tournamentName: sessionData.tournamentName || 'Imported Tournament'
    };
  } catch (error) {
    console.error('Failed to import session:', error);
    return null;
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    return new Promise((resolve, reject) => {
      if (document.execCommand('copy')) {
        resolve();
      } else {
        reject(new Error('Failed to copy to clipboard'));
      }
      document.body.removeChild(textArea);
    });
  }
}