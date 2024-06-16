document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Ensure elements exist
    const loginButtonSidebar = document.getElementById('loginButtonSidebar');
    const loginFormContainer = document.getElementById('loginFormContainer');
    const toggleSignUpFormLink = document.getElementById('toggleSignUpForm');
    const signUpFormContainer = document.getElementById('signUpFormContainer');

    if (!loginButtonSidebar || !loginFormContainer || !toggleSignUpFormLink || !signUpFormContainer) {
        console.error('One or more elements are not found');
        return;
    }

    // Function to execute commands for text formatting
    function execCmd(command) {
        document.execCommand(command, false, null);
    }

    // Event listener for the sidebar toggle button
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        var sidebar = document.getElementById('sidebarMenu');
        if (sidebar.classList.contains('d-none')) {
            sidebar.classList.remove('d-none');
            sidebar.classList.add('d-block');
        } else {
            sidebar.classList.remove('d-block');
            sidebar.classList.add('d-none');
        }
    });

    // Toggle login form visibility
    loginButtonSidebar.addEventListener('click', function() {
        if (loginFormContainer.classList.contains('d-none')) {
            loginFormContainer.classList.remove('d-none');
        } else {
            loginFormContainer.classList.add('d-none');
        }
    });

    // Toggle sign up form visibility
    toggleSignUpFormLink.addEventListener('click', function() {
        if (signUpFormContainer.classList.contains('d-none')) {
            signUpFormContainer.classList.remove('d-none');
        } else {
            signUpFormContainer.classList.add('d-none');
        }
    });

    // Check if the user is logged in on page load
    const token = localStorage.getItem('token');
    if (token) {
        fetchNotes();
        updateLoginButton(true);
    }

    // Event listener for form (note) submission
    document.getElementById('noteForm').addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Confirm save action
        const confirmSave = confirm('Are you sure you want to save this note?');
        if (!confirmSave) {
            return; // If the user cancels, do not proceed with saving
        }

        // Get form values
        const noteId = document.getElementById('noteId').value; // Get the hidden noteId field value
        const title = document.getElementById('noteTitle').value;
        const date = document.getElementById('noteDate').value;
        const content = document.getElementById('noteContent').innerHTML;

        // Create the note object
        const note = { title, date, content };
        const token = localStorage.getItem('token');

        try {
            let response;
            if (noteId) {
                // Update existing note
                response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify(note),
                });
            } else {
                // Create new note
                response = await fetch('http://localhost:5000/api/notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    },
                    body: JSON.stringify(note),
                });
            }

            if (response.ok) {
                const result = await response.json();
                console.log('Note saved:', result);

                // Optionally, clear the form after submission
                document.getElementById('noteForm').reset();
                document.getElementById('noteContent').innerHTML = '';
                document.getElementById('noteId').value = ''; // Clear the hidden noteId field

                // Fetch and display the updated notes
                fetchNotes();
            } else {
                console.error('Failed to save the note');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Delete note functionality
    document.getElementById('deleteButton').addEventListener('click', async function() {
        const noteId = document.getElementById('noteId').value; // Get the hidden noteId field value

        // Confirm delete action
        const confirmDelete = confirm('Are you sure you want to delete this note?');
        if (!confirmDelete) {
            return; // If the user cancels, do not proceed with deletion
        }

        const token = localStorage.getItem('token');

        if (noteId) {
            try {
                const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
                    method: 'DELETE',
                    headers: {
                        'x-auth-token': token
                    }
                });

                if (response.ok) {
                    console.log('Note deleted');

                    // Optionally, clear the form after deletion
                    document.getElementById('noteForm').reset();
                    document.getElementById('noteContent').innerHTML = '';
                    document.getElementById('noteId').value = ''; // Clear the hidden noteId field

                    // Fetch and display the updated notes
                    fetchNotes();
                } else {
                    console.error('Failed to delete the note');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.error('No note selected to delete');
        }
    });

    // Fetch and display note titles in the sidebar
    async function fetchNotes() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/notes', {
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const notes = await response.json();

            const notesList = document.getElementById('notesList');
            notesList.innerHTML = '';

            if (Array.isArray(notes)) {
                notes.forEach(note => {
                    const noteItem = document.createElement('li');
                    noteItem.classList.add('nav-item');
                    noteItem.innerHTML = `
                        <a class="nav-link note-title" href="#" data-id="${note._id}">
                            ${note.title}
                        </a>
                    `;
                    notesList.appendChild(noteItem);
                });

                // Add event listeners for note titles
                document.querySelectorAll('.note-title').forEach(link => {
                    link.addEventListener('click', loadNote);
                });
            } else {
                console.error('Notes response is not an array:', notes);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }

    // Load note into the form
    async function loadNote(event) {
        event.preventDefault();

        const noteId = this.getAttribute('data-id');
        const token = localStorage.getItem('token');

        try {
            const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
                headers: {
                    'x-auth-token': token
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const note = await response.json();

            // Populate the form with the note data
            document.getElementById('noteId').value = note._id; // Set the hidden noteId field
            document.getElementById('noteTitle').value = note.title;
            document.getElementById('noteDate').value = note.date;
            document.getElementById('noteContent').innerHTML = note.content;
        } catch (error) {
            console.error('Error loading note:', error);
        }
    }

    // Event listener for sign-up form submission
    document.getElementById('signUpForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('token', result.token);
                console.log('User signed up and logged in:', result);

                // Redirect or update UI after successful sign-up
                fetchNotes();
                updateLoginButton(true); // Update button to Logout
            } else {
                const error = await response.json();
                console.error('Failed to sign up:', error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Event listener for login form submission
    document.getElementById('loginForm').addEventListener('submit', async function(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('token', result.token);
                console.log('User logged in:', result);

                // Redirect or update UI after successful login
                fetchNotes();
                updateLoginButton(true); // Update button to Logout
            } else {
                const error = await response.json();
                console.error('Failed to login:', error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Function to update the Login button text and functionality
    function updateLoginButton(isLoggedIn) {
        const loginButton = document.getElementById('loginButtonSidebar');
        if (isLoggedIn) {
            loginButton.textContent = 'Logout';
            loginButton.classList.remove('btn-primary');
            loginButton.classList.add('btn-danger');
            loginButton.onclick = handleLogout;
        } else {
            loginButton.textContent = 'Login';
            loginButton.classList.remove('btn-danger');
            loginButton.classList.add('btn-primary');
            loginButton.onclick = toggleLoginForm;
        }
    }

    // Function to handle logout
    function handleLogout() {
        const confirmLogout = confirm('Are you sure you want to logout?');
        if (confirmLogout) {
            localStorage.removeItem('token');
            console.log('User logged out');

            // Clear notes and update UI
            document.getElementById('notesList').innerHTML = '';
            updateLoginButton(false); // Update button to Login
        }
    }

    // Function to toggle the login form visibility
    function toggleLoginForm() {
        if (loginFormContainer.classList.contains('d-none')) {
            loginFormContainer.classList.remove('d-none');
        } else {
            loginFormContainer.classList.add('d-none');
        }
    }

    // Function to toggle the sign up form visibility
    function toggleSignUpForm() {
        if (signUpFormContainer.classList.contains('d-none')) {
            signUpFormContainer.classList.remove('d-none');
        } else {
            signUpFormContainer.classList.add('d-none');
        }
    }
});