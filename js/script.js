document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const passwordModal = document.getElementById('passwordModal');
    const passwordInput = document.getElementById('passwordInput');
    const submitPasswordBtn = document.getElementById('submitPassword');
    const passwordError = document.getElementById('passwordError');
    
    // 确保导航栏可见
    const topHeader = document.querySelector('.top-header');
    if (topHeader) {
        topHeader.style.display = 'block';
        console.log('Top header found and displayed');
    } else {
        console.error('Top header not found');
    }
    
    const urlInput = document.getElementById('urlInput');
    const pasteButton = document.getElementById('pasteButton');
    const clearButton = document.getElementById('clearButton');
    const startButton = document.getElementById('startButton');
    
    const resultSection = document.getElementById('resultSection');
    const loader = document.getElementById('loader');
    const resultContent = document.getElementById('resultContent');
    const errorContainer = document.getElementById('errorContainer');
    const errorMessage = document.getElementById('errorMessage');
    
    const videoTitle = document.getElementById('videoTitle');
    const videoPreview = document.getElementById('videoPreview');
    const coverPreview = document.getElementById('coverPreview');
    const downloadVideo = document.getElementById('downloadVideo');
    const downloadCover = document.getElementById('downloadCover');
    
    // API Configuration
    const API_BASE_URL = 'https://api.guijianpan.com/waterRemoveDetail/xxmQsyByAk';
    const API_KEY = 'ce05300d890d48588d4bdf048a3ef271';
    
    // Password verification
    const CORRECT_PASSWORD = '123456';
    
    // Check if password is stored in session
    if (sessionStorage.getItem('passwordVerified') !== 'true') {
        passwordModal.style.display = 'flex';
    } else {
        passwordModal.style.display = 'none';
    }
    
    // Password submission
    submitPasswordBtn.addEventListener('click', function() {
        if (passwordInput.value === CORRECT_PASSWORD) {
            sessionStorage.setItem('passwordVerified', 'true');
            passwordModal.style.display = 'none';
            passwordError.textContent = '';
        } else {
            passwordError.textContent = 'Incorrect password. Please try again.';
            passwordInput.value = '';
        }
    });
    
    // Enter key for password submission
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            submitPasswordBtn.click();
        }
    });
    
    // Paste button functionality
    pasteButton.addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            urlInput.value = text;
        } catch (err) {
            console.error('Failed to read clipboard: ', err);
            alert('Unable to access clipboard. Please paste the link manually.');
        }
    });
    
    // Clear button functionality
    clearButton.addEventListener('click', function() {
        urlInput.value = '';
        urlInput.focus();
        
        // Hide result section if shown
        resultSection.style.display = 'none';
    });
    
    // Extract URL from text
    function extractUrl(text) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const matches = text.match(urlRegex);
        return matches ? matches[0] : null;
    }
    
    // Start button functionality
    startButton.addEventListener('click', function() {
        const inputText = urlInput.value.trim();
        
        if (!inputText) {
            showError('Please enter a link or text containing a link.');
            return;
        }
        
        const url = extractUrl(inputText);
        
        if (!url) {
            showError('No valid URL found in the input.');
            return;
        }
        
        processUrl(url);
    });
    
    // Process URL and fetch data
    function processUrl(url) {
        // Show result section and loader
        if (resultSection) {
            resultSection.style.display = 'block';
        }
        if (loader) {
            loader.style.display = 'flex';
        }
        if (resultContent) {
            resultContent.style.display = 'none';
        }
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
        
        // Scroll to result section
        if (resultSection) {
            resultSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Construct API URL
        const apiUrl = `${API_BASE_URL}?ak=${API_KEY}&link=${encodeURIComponent(url)}`;
        
        // Fetch data from API
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.code === '10000' && data.content && data.content.success) {
                    displayResult(data.content);
                } else {
                    throw new Error(data.msg || 'Failed to process the URL');
                }
            })
            .catch(error => {
                showError(error.message || 'An error occurred while processing your request.');
            });
    }
    
    // Display result
    function displayResult(content) {
        // Hide loader and show content
        loader.style.display = 'none';
        resultContent.style.display = 'block';
        
        // Set video title
        if (videoTitle) {
            videoTitle.textContent = content.title || 'Untitled';
        }
        
        // Display video preview
        if (videoPreview) {
            if (content.url) {
                videoPreview.innerHTML = `<video controls><source src="${content.url}" type="video/mp4">Your browser does not support the video tag.</video>`;
                if (downloadVideo) {
                    downloadVideo.style.display = 'block';
                    
                    // Set download video button
                    downloadVideo.onclick = function() {
                        downloadMedia(content.url, `${content.title || 'video'}.mp4`);
                    };
                }
            } else {
                videoPreview.innerHTML = '<p>No video available</p>';
                if (downloadVideo) {
                    downloadVideo.style.display = 'none';
                }
            }
        }
        
        // Display cover preview
        if (coverPreview) {
            if (content.cover) {
                coverPreview.innerHTML = `<img src="${content.cover}" alt="Cover">`;
                if (downloadCover) {
                    downloadCover.style.display = 'block';
                    
                    // Set download cover button
                    downloadCover.onclick = function() {
                        downloadMedia(content.cover, `${content.title || 'cover'}.jpg`);
                    };
                }
            } else {
                coverPreview.innerHTML = '<p>No cover available</p>';
                if (downloadCover) {
                    downloadCover.style.display = 'none';
                }
            }
        }
    }
    
    // Show error message
    function showError(message) {
        if (resultSection) {
            resultSection.style.display = 'block';
        }
        if (loader) {
            loader.style.display = 'none';
        }
        if (resultContent) {
            resultContent.style.display = 'none';
        }
        if (errorContainer) {
            errorContainer.style.display = 'block';
        }
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }
    
    // Download media function
    function downloadMedia(url, filename) {
        // Create a temporary anchor element
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        
        // Append to body, click and remove
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});