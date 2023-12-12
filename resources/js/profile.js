document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profile-form');
    const passwordForm = document.getElementById('password-form');

    profileForm.addEventListener('submit', async function(e) {
        await submitForm(profileForm, '/api/update-profile');
    });

    passwordForm.addEventListener('submit', async function(e) {
        await submitForm(passwordForm, '/api/update-password');
    });
});

function editProfile() {
    document.getElementById('profile-info').style.display = 'none';
    document.getElementById('edit-profile').style.display = 'flex';
    document.getElementById('edit-password').style.display = 'flex';
}

async function submitForm(form, url) {
    const formData = new URLSearchParams(new FormData(form)).toString();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        if (response.ok) {
        } else {
            const errorData = await response.json();
            displayError(errorData.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displayError(errorMessage) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = errorMessage;
    errorElement.style.display = 'block';
}
