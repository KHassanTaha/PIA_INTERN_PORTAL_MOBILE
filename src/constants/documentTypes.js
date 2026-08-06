/**
 * constants/documentTypes.js
 *
 * Single source of truth for both document categories:
 *   - UPLOAD_TYPES: things the intern submits FROM their device
 *     (profile photo, CNIC, student ID, resume) for admin/mentor review.
 *   - REQUEST_TYPES: things the intern REQUESTS the system generate FOR
 *     them (ID card, gate pass, letter of internship) - no file to pick,
 *     just a request; once approved, a generated file becomes viewable.
 *
 * Size/type limits below are a reasonable starting point, not a
 * confirmed org policy - flag to the project owner if PIA has an
 * existing document-handling policy that should override these.
 */

export const MimeGroup = {
  IMAGE: ['image/jpeg', 'image/png'],
  PDF: ['application/pdf'],
  DOC: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

const MB = 1024 * 1024;

export const UploadDocumentType = {
  PROFILE_PHOTO: 'PROFILE_PHOTO',
  CNIC: 'CNIC',
  STUDENT_ID: 'STUDENT_ID',
  RESUME: 'RESUME',
};

export const UPLOAD_TYPE_META = {
  [UploadDocumentType.PROFILE_PHOTO]: {
    label: 'Profile Photo',
    icon: 'account-box-outline',
    acceptedMimeTypes: MimeGroup.IMAGE,
    acceptedExtensionsLabel: 'JPG or PNG',
    maxSizeBytes: 5 * MB,
    pickerKind: 'image', // routes to the image picker (camera or gallery)
  },
  [UploadDocumentType.CNIC]: {
    label: 'CNIC',
    icon: 'card-account-details-outline',
    acceptedMimeTypes: [...MimeGroup.IMAGE, ...MimeGroup.PDF],
    acceptedExtensionsLabel: 'JPG, PNG, or PDF',
    maxSizeBytes: 5 * MB,
    pickerKind: 'either', // person can choose photo or file picker
  },
  [UploadDocumentType.STUDENT_ID]: {
    label: 'Student ID',
    icon: 'school-outline',
    acceptedMimeTypes: [...MimeGroup.IMAGE, ...MimeGroup.PDF],
    acceptedExtensionsLabel: 'JPG, PNG, or PDF',
    maxSizeBytes: 5 * MB,
    pickerKind: 'either',
  },
  [UploadDocumentType.RESUME]: {
    label: 'Resume',
    icon: 'file-account-outline',
    acceptedMimeTypes: MimeGroup.DOC,
    acceptedExtensionsLabel: 'PDF or Word (.doc/.docx)',
    maxSizeBytes: 5 * MB,
    pickerKind: 'document', // no photo option makes sense for a resume
  },
};

export const RequestDocumentType = {
  ID_CARD: 'ID_CARD',
  GATE_PASS: 'GATE_PASS',
  LETTER_OF_INTERNSHIP: 'LETTER_OF_INTERNSHIP',
};

export const REQUEST_TYPE_META = {
  [RequestDocumentType.ID_CARD]: {
    label: 'ID Card',
    icon: 'card-account-details-outline',
    description: 'Generates a soft-copy ID card with your current department and mentor details.',
  },
  [RequestDocumentType.GATE_PASS]: {
    label: 'Gate Pass',
    icon: 'card-account-details-star-outline',
    description: 'Generates a gate pass for entry/exit during your internship period.',
  },
  [RequestDocumentType.LETTER_OF_INTERNSHIP]: {
    label: 'Letter of Internship',
    icon: 'file-document-outline',
    description: 'Requires mentor sign-off before it is issued.',
  },
};

/**
 * Shared status vocabulary for BOTH uploads and requests - one set of
 * states covers "a CNIC photo awaiting review" and "an ID card request
 * awaiting review" identically, so StatusChip/filter logic doesn't need
 * two parallel enums.
 */
export const DocumentStatus = {
  PENDING: 'PENDING', // submitted, not yet looked at
  IN_REVIEW: 'IN_REVIEW', // a reviewer has opened it but not decided yet
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};