// Import Firebase SDKs from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --- CONFIGURATION ---
// TODO: Replace with your values from src/lib/firebase/config.ts
const firebaseConfig = {
  apiKey: "AIzaSyAdxhMoFP3gKGB1_muHJOtSqjStw_HzvJc",
  authDomain: "smartlibz.firebaseapp.com",
  projectId: "smartlibz",
  storageBucket: "smartlibz.firebasestorage.app",
  messagingSenderId: "1099209948074",
  appId: "1:1099209948074:web:3249a5609618ef47a709d3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- STATE MANAGEMENT ---
let currentUser = null; // Contains Auth + Firestore User Data
let resources = []; // Cache for dashboard

// --- DOM ELEMENTS ---
const views = {
    loading: document.getElementById('view-loading'),
    login: document.getElementById('view-login'),
    signup: document.getElementById('view-signup'),
    dashboard: document.getElementById('view-dashboard'),
    upload: document.getElementById('view-upload')
};

const navbar = document.getElementById('navbar');
const navUpload = document.getElementById('nav-upload');
const userDisplayName = document.getElementById('user-display-name');

// --- ROUTER ---
function navigateTo(hash) {
    // Hide all views
    Object.values(views).forEach(el => el.classList.add('hidden'));
    
    // Auth Guard
    if (!currentUser && hash !== '#login' && hash !== '#signup') {
        window.location.hash = '#login';
        return;
    }

    // Default to dashboard if logged in and at root
    if (currentUser && (hash === '' || hash === '#login' || hash === '#signup')) {
        window.location.hash = '#dashboard';
        return;
    }

    const target = hash.replace('#', '') || 'login';
    
    // Show Nav if logged in
    if (currentUser) {
        navbar.classList.remove('hidden');
        userDisplayName.textContent = currentUser.displayName;
        if (currentUser.role === 'admin') navUpload.classList.remove('hidden');
    } else {
        navbar.classList.add('hidden');
    }

    // Load View Logic
    if (target === 'dashboard') loadDashboard();
    if (target === 'upload') resetUploadForm();

    // Show Target View
    if (views[target]) views[target].classList.remove('hidden');
}

window.addEventListener('hashchange', () => navigateTo(window.location.hash));

// --- AUTH LOGIC ---

// 1. Listen for Auth State Changes
onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
        try {
            // Fetch extended user data from Firestore (Role, OrgID)
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
                currentUser = { ...firebaseUser, ...userDoc.data() };
            } else {
                // Fallback if firestore doc missing
                currentUser = firebaseUser;
            }
            navigateTo(window.location.hash || '#dashboard');
        } catch (err) {
            console.error("Error fetching user details", err);
            currentUser = firebaseUser;
        }
    } else {
        currentUser = null;
        navigateTo('#login');
    }
    views.loading.classList.add('hidden');
});

// 2. Signup Action
document.getElementById('form-signup').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const orgName = document.getElementById('signup-org').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const errorDiv = document.getElementById('signup-error');
    const btn = e.target.querySelector('button');

    try {
        errorDiv.classList.add('hidden');
        btn.disabled = true;
        btn.innerText = "Creating...";

        // A. Create Auth User
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCred.user;
        await updateProfile(user, { displayName: name });

        // B. Create Organization
        const orgRef = doc(collection(db, "organizations"));
        await setDoc(orgRef, {
            name: orgName,
            planType: "free",
            createdAt: serverTimestamp(),
            status: "active",
            limits: { maxStorage: 1024 * 1024 * 1024 } // 1GB
        });

        // C. Create User Doc (Admin Role)
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: name,
            role: "admin",
            organizationId: orgRef.id,
            createdAt: serverTimestamp()
        });

        // Redirect handled by onAuthStateChanged
    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('hidden');
        btn.disabled = false;
        btn.innerText = "Create Account";
    }
});

// 3. Login Action
document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        errorDiv.classList.add('hidden');
        await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        errorDiv.textContent = "Invalid email or password.";
        errorDiv.classList.remove('hidden');
    }
});

// 4. Logout Action
document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));


// --- DASHBOARD LOGIC ---

async function loadDashboard() {
    if (!currentUser || !currentUser.organizationId) return;

    const grid = document.getElementById('resource-grid');
    const noRes = document.getElementById('no-resources');
    
    // Clear current
    grid.innerHTML = '<div class="col-span-3 text-center"><div class="spinner inline-block"></div></div>';
    noRes.classList.add('hidden');

    try {
        // Fetch Resources
        const q = query(
            collection(db, "resources"),
            where("organizationId", "==", currentUser.organizationId),
            orderBy("createdAt", "desc")
        );
        
        const snapshot = await getDocs(q);
        resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        grid.innerHTML = ''; // Clear spinner

        if (resources.length === 0) {
            noRes.classList.remove('hidden');
            return;
        }

        renderResources(resources);

    } catch (err) {
        console.error("Dashboard Load Error:", err);
        // Note: This often fails if Index is missing.
        if (err.message.includes("index")) {
            grid.innerHTML = `<div class="col-span-3 text-red-500 text-center">Error: Missing Firestore Index. Please check console.</div>`;
        }
    }
}

function renderResources(list) {
    const grid = document.getElementById('resource-grid');
    grid.innerHTML = '';
    
    list.forEach(res => {
        const typeIcon = getIconForType(res.type);
        const card = document.createElement('div');
        card.className = 'bg-white overflow-hidden shadow rounded-lg border border-gray-100 hover:shadow-md transition-shadow';
        card.innerHTML = `
            <div class="p-5">
                <div class="flex items-center">
                    <div class="flex-shrink-0 text-blue-500 text-2xl">
                        ${typeIcon}
                    </div>
                    <div class="ml-4 flex-1">
                        <h3 class="text-lg font-medium text-gray-900 truncate" title="${res.title}">${res.title}</h3>
                        <p class="text-sm text-gray-500 truncate">${res.type || 'file'} • ${(res.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                </div>
                <p class="mt-3 text-sm text-gray-600 line-clamp-2 h-10">${res.description || 'No description provided.'}</p>
            </div>
            <div class="bg-gray-50 px-5 py-3 flex justify-between items-center">
                <a href="${res.fileUrl}" target="_blank" class="text-sm font-medium text-blue-600 hover:text-blue-500">Download</a>
                <span class="text-xs text-gray-400">${new Date(res.createdAt?.seconds * 1000).toLocaleDateString()}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Search Logic
document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = resources.filter(r => 
        r.title.toLowerCase().includes(term) || 
        (r.description && r.description.toLowerCase().includes(term))
    );
    renderResources(filtered);
});

function getIconForType(type) {
    if (type === 'pdf') return '<i class="fa-regular fa-file-pdf"></i>';
    if (type === 'image') return '<i class="fa-regular fa-image"></i>';
    if (type === 'video') return '<i class="fa-regular fa-file-video"></i>';
    return '<i class="fa-regular fa-file"></i>';
}


// --- UPLOAD LOGIC ---

const fileInput = document.getElementById('file-input');
let selectedFile = null;

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) {
        selectedFile = e.target.files[0];
        const display = document.getElementById('file-display-area');
        // Update UI to show selected file
        display.innerHTML = `
            <i class="fa-solid fa-file-lines text-4xl text-blue-500 mb-2"></i>
            <p class="text-sm font-medium text-gray-900">${selectedFile.name}</p>
            <p class="text-xs text-gray-500">${(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        `;
        // Auto fill title
        if(!document.getElementById('upload-title').value) {
            document.getElementById('upload-title').value = selectedFile.name.split('.')[0];
        }
    }
});

document.getElementById('form-upload').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedFile || !currentUser) return;

    const title = document.getElementById('upload-title').value;
    const desc = document.getElementById('upload-desc').value;
    const btn = document.getElementById('btn-submit-upload');
    const progressBar = document.getElementById('upload-progress-bar');
    const progressContainer = document.getElementById('upload-progress-container');

    btn.disabled = true;
    progressContainer.classList.remove('hidden');

    try {
        // 1. Upload to Storage
        const path = `organizations/${currentUser.organizationId}/resources/${Date.now()}-${selectedFile.name}`;
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                progressBar.style.width = progress + '%';
            },
            (error) => { throw error; },
            async () => {
                // 2. Get URL & Save to Firestore
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                
                await addDoc(collection(db, "resources"), {
                    organizationId: currentUser.organizationId,
                    title: title,
                    description: desc,
                    fileUrl: downloadURL,
                    fileName: selectedFile.name,
                    fileSize: selectedFile.size,
                    type: selectedFile.type.startsWith('image') ? 'image' : (selectedFile.type === 'application/pdf' ? 'pdf' : 'doc'),
                    createdAt: serverTimestamp(),
                    createdBy: currentUser.uid,
                    downloadAllowed: true
                });

                // Success UI
                document.getElementById('form-upload').classList.add('hidden');
                document.getElementById('upload-success').classList.remove('hidden');
                document.getElementById('upload-success').classList.add('flex');
            }
        );

    } catch (error) {
        console.error("Upload failed", error);
        alert("Upload failed: " + error.message);
        btn.disabled = false;
    }
});

function resetUploadForm() {
    document.getElementById('form-upload').reset();
    document.getElementById('form-upload').classList.remove('hidden');
    document.getElementById('upload-success').classList.add('hidden');
    document.getElementById('upload-success').classList.remove('flex');
    document.getElementById('upload-progress-container').classList.add('hidden');
    document.getElementById('btn-submit-upload').disabled = false;
    selectedFile = null;
    document.getElementById('file-display-area').innerHTML = `
        <i class="fa-solid fa-cloud-arrow-up text-4xl text-gray-400 mb-2"></i>
        <p class="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
        <p class="text-xs text-gray-500">PDF, Images, DOC, Video</p>
    `;
}

document.getElementById('btn-upload-more').addEventListener('click', resetUploadForm);