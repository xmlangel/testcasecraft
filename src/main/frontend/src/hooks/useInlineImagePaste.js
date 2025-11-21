import { useCallback, useMemo, useState } from 'react';

const createDefaultDialogState = () => ({
  open: false,
  placeholder: '',
  fieldConfig: null,
  attachment: null,
  altText: '',
  width: '100',
  widthUnit: '%',
});

const sanitizeAltText = (value) => {
  if (!value || typeof value !== 'string') return 'inline-image';
  return value.replace(/"/g, '&quot;') || 'inline-image';
};

const defaultErrorHandler = (message) => {
  if (message) {
    console.error(message);
  }
};

const useInlineImagePaste = ({
  api,
  testCaseId,
  isViewer,
  t,
  getFieldValue,
  updateFieldValue,
  onError = defaultErrorHandler,
}) => {
  const [imageDialogState, setImageDialogState] = useState(createDefaultDialogState);
  const [inlineImageUploading, setInlineImageUploading] = useState(false);

  const notifyError = useCallback((message) => {
    if (!message) return;
    onError(message);
  }, [onError]);

  const resetDialogState = useCallback(() => setImageDialogState(createDefaultDialogState()), []);

  const insertPlaceholderAtSelection = useCallback((fieldConfig, placeholder, selectionStart, selectionEnd) => {
    updateFieldValue(fieldConfig, (currentValue = '') => {
      const valueLength = currentValue.length;
      const startPosition = Math.max(0, Math.min(selectionStart ?? valueLength, valueLength));
      const endPosition = Math.max(0, Math.min(selectionEnd ?? startPosition, valueLength));
      return `${currentValue.slice(0, startPosition)}${placeholder}${currentValue.slice(endPosition)}`;
    });
  }, [updateFieldValue]);

  const replacePlaceholder = useCallback((fieldConfig, placeholder, replacement) => {
    if (!placeholder) return;
    updateFieldValue(fieldConfig, (currentValue = '') => currentValue.replace(placeholder, replacement));
  }, [updateFieldValue]);

  const getDefaultAltText = useCallback((fileName) => {
    if (!fileName) return 'inline-image';
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    return baseName || 'inline-image';
  }, []);

  const uploadInlineImage = useCallback(async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', t('testcase.inlineImage.description', '본문에 삽입된 이미지'));

    const response = await api(`/api/testcase-attachments/upload/${testCaseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': undefined,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = t('testcase.inlineImage.uploadFailed', '이미지 업로드에 실패했습니다.');
      try {
        const text = await response.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            errorMessage = parsed.message || errorMessage;
          } catch (err) {
            errorMessage = text;
          }
        }
      } catch (parseError) {
        console.error('inline image upload error parse failed:', parseError);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json().catch(() => null);
    const attachment = data?.attachment;

    if (!attachment || !attachment.publicUrl) {
      throw new Error(t('testcase.inlineImage.urlMissing', '이미지 URL을 생성하지 못했습니다.'));
    }

    return attachment;
  }, [api, t, testCaseId]);

  const handleMarkdownPaste = useCallback(async (event, fieldConfig) => {
    if (isViewer || !event?.clipboardData || !fieldConfig) return;

    const items = Array.from(event.clipboardData.items || []);
    const imageItem = items.find((item) => item.kind === 'file' && item.type?.startsWith('image/'));
    if (!imageItem) return;

    if (!testCaseId) {
      notifyError(t('testcase.inlineImage.saveRequired', '이미지를 붙여넣으려면 테스트케이스를 먼저 저장하세요.'));
      return;
    }

    const file = imageItem.getAsFile();
    if (!file) return;

    event.preventDefault();

    const target = event.target;
    const currentValue = getFieldValue(fieldConfig);
    const selectionStart = typeof target?.selectionStart === 'number' ? target.selectionStart : currentValue.length;
    const selectionEnd = typeof target?.selectionEnd === 'number' ? target.selectionEnd : selectionStart;

    const placeholderId = `inline-img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const placeholderText = `![${t('testcase.inlineImage.uploading', '이미지 업로드 중')}...](${placeholderId})`;

    insertPlaceholderAtSelection(fieldConfig, placeholderText, selectionStart, selectionEnd);

    try {
      setInlineImageUploading(true);
      const attachment = await uploadInlineImage(file);
      setImageDialogState({
        open: true,
        placeholder: placeholderText,
        fieldConfig,
        attachment,
        altText: getDefaultAltText(file.name),
        width: '100',
        widthUnit: '%',
      });
    } catch (error) {
      console.error('inline image upload failed:', error);
      replacePlaceholder(fieldConfig, placeholderText, '');
      notifyError(error.message || t('testcase.inlineImage.uploadFailed', '이미지 업로드에 실패했습니다.'));
    } finally {
      setInlineImageUploading(false);
    }
  }, [
    getDefaultAltText,
    getFieldValue,
    insertPlaceholderAtSelection,
    isViewer,
    notifyError,
    replacePlaceholder,
    t,
    testCaseId,
    uploadInlineImage,
  ]);

  const handleInlineImageDialogClose = useCallback(async () => {
    // 업로드된 attachment 삭제
    if (imageDialogState.attachment?.id) {
      try {
        const response = await api(`/api/testcase-attachments/${imageDialogState.attachment.id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          console.error('Failed to delete uploaded image attachment:', imageDialogState.attachment.id);
        }
      } catch (error) {
        console.error('Error deleting uploaded image attachment:', error);
      }
    }

    // placeholder 텍스트 제거
    if (imageDialogState.placeholder && imageDialogState.fieldConfig) {
      replacePlaceholder(imageDialogState.fieldConfig, imageDialogState.placeholder, '');
    }

    // 다이얼로그 상태 초기화
    resetDialogState();
  }, [api, imageDialogState.attachment, imageDialogState.fieldConfig, imageDialogState.placeholder, replacePlaceholder, resetDialogState]);

  const handleInlineImageInsert = useCallback(() => {
    const { attachment, placeholder, fieldConfig, altText, width, widthUnit } = imageDialogState;
    if (!attachment?.publicUrl || !placeholder || !fieldConfig) {
      handleInlineImageDialogClose();
      return;
    }

    const widthValue = width?.trim();
    const numericWidth = widthValue ? Number(widthValue) : null;
    const validWidth = numericWidth && Number.isFinite(numericWidth) && numericWidth > 0;
    const unit = widthUnit === '%' ? '%' : 'px';
    const styleParts = [];
    if (validWidth) {
      styleParts.push(`width: ${numericWidth}${unit}`);
    }
    styleParts.push('max-width: 100%');
    styleParts.push('height: auto');
    const styleAttr = styleParts.join('; ');

    const imageMarkup = `<img src="${attachment.publicUrl}" alt="${sanitizeAltText(altText)}" data-attachment-id="${attachment.id}" style="${styleAttr}" />`;

    replacePlaceholder(fieldConfig, placeholder, imageMarkup);
    resetDialogState();
  }, [handleInlineImageDialogClose, imageDialogState, replacePlaceholder, resetDialogState]);

  const updateImageDialogState = useCallback((updater) => {
    setImageDialogState((prev) => {
      const nextState = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return nextState;
    });
  }, []);

  return useMemo(() => ({
    imageDialogState,
    inlineImageUploading,
    handleMarkdownPaste,
    handleInlineImageDialogClose,
    handleInlineImageInsert,
    updateImageDialogState,
  }), [
    handleInlineImageDialogClose,
    handleInlineImageInsert,
    handleMarkdownPaste,
    imageDialogState,
    inlineImageUploading,
    updateImageDialogState,
  ]);
};

export default useInlineImagePaste;
