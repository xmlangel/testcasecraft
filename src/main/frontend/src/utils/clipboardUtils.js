/**
 * Clipboard utility functions
 */

/**
 * Copies text to the clipboard using the modern navigator.clipboard API.
 *
 * @param {string} text - The text to copy to the clipboard.
 * @returns {Promise<boolean>} - A promise that resolves to true if the copy was successful, false otherwise.
 */
export const copyToClipboard = async (text) => {
  if (!text) return false;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Ensure the textarea is not visible
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);

      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      return successful;
    }
  } catch (err) {
    console.error("Failed to copy text: ", err);
    return false;
  }
};
