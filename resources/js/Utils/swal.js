import Swal from 'sweetalert2';

// Toast notification (top-right)
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

// Success toast
export const showSuccess = (message) => {
    Toast.fire({
        icon: 'success',
        title: message
    });
};

// Error toast
export const showError = (message) => {
    Toast.fire({
        icon: 'error',
        title: message
    });
};

// Warning toast
export const showWarning = (message) => {
    Toast.fire({
        icon: 'warning',
        title: message
    });
};

// Info toast
export const showInfo = (message) => {
    Toast.fire({
        icon: 'info',
        title: message
    });
};

// Confirm dialog
export const confirmDialog = async ({
    title = 'Are you sure?',
    text = '',
    icon = 'warning',
    confirmButtonText = 'Yes',
    cancelButtonText = 'Cancel',
    confirmButtonColor = '#3085d6',
    cancelButtonColor = '#d33',
}) => {
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor,
        cancelButtonColor,
        confirmButtonText,
        cancelButtonText,
    });
    return result.isConfirmed;
};

// Delete confirmation
export const confirmDelete = async (itemName = 'this item') => {
    return confirmDialog({
        title: 'Delete Confirmation',
        text: `Are you sure you want to delete ${itemName}? This action cannot be undone!`,
        icon: 'warning',
        confirmButtonText: '<i class="fas fa-trash"></i> Yes, delete it!',
        cancelButtonText: '<i class="fas fa-times"></i> Cancel',
        confirmButtonColor: '#dc2626',
    });
};

// Workflow action confirmation (for PPM workflow steps)
export const confirmAction = async ({
    title = 'Confirm Action',
    text = '',
    icon = 'question',
    confirmText = 'Yes, Proceed',
    confirmColor = '#3085d6',
}) => {
    return confirmDialog({
        title,
        text,
        icon,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        confirmButtonColor: confirmColor,
    });
};

// Success dialog (centered)
export const successDialog = (title, text = '') => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonColor: '#10b981',
    });
};

// Error dialog (centered)
export const errorDialog = (title, text = '') => {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: '#dc2626',
    });
};

// Loading
export const showLoading = (title = 'Loading...') => {
    Swal.fire({
        title,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
};

// Close loading
export const closeLoading = () => {
    Swal.close();
};

export default Swal;
