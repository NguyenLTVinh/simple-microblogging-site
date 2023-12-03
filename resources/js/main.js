document.addEventListener("DOMContentLoaded", () => {
    setInterval(updateLikeCounts, 1000);
});

function goToPost(postId) {
    window.location.href = `/post/${postId}`;
}

async function likePost(postId) {
    try {
        const likeButton = document.getElementById(`like-btn-${postId}`);
        const likeCountElement = document.getElementById(`like-count-${postId}`);

        if (likeButton.dataset.isCoolingDown === 'true') {
            return;
        }
        likeButton.dataset.isCoolingDown = 'true';
        likeButton.disabled = true;

        const response = await fetch(`api/like-post/${postId}`, { method: 'POST' });

        if (response.status === 403) {
            // User is not logged in, redirect to the login page
            window.location.href = '/login';
            return;
        }

        if (response.ok) {
            let currentCount = parseInt(likeCountElement.innerText) || 0;
            if (likeButton.dataset.liked === 'true') {
                currentCount--;
                likeButton.dataset.liked = 'false';
            } else {
                currentCount++;
                likeButton.dataset.liked = 'true';
            }
            //likeCountElement.innerText = currentCount;
        }

        setTimeout(() => {
            likeButton.dataset.isCoolingDown = 'false';
            likeButton.disabled = false;
        }, 1500);

    } catch (err) {
        console.error('Error:', err);
    }
}

async function updateLikeCounts() {
    try {
        const response = await fetch('/api/like-counts');
        const likeCounts = await response.json();

        for (const postId in likeCounts) {
            const likeCountElement = document.getElementById(`like-count-${postId}`);
            if (likeCountElement) {
                likeCountElement.innerText = likeCounts[postId];
            }
        }
    } catch (err) {
        console.error(err);
    }
}