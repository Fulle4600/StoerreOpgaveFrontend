const { createApp } = Vue;

const API = 'http://localhost:5072/api/Music';
const AUTH = 'http://localhost:5072/api/Auth/login';

createApp({
    data() {
        return {
            token: localStorage.getItem('token') || null,
            loginUsername: '',
            loginPassword: '',
            loginError: null,
            records: [],
            searchTitle: '',
            searchArtist: '',
            newRecord: { title: '', artist: '', duration: 0, publicationDate: 0 },
            editingId: null,
            editRecord: { title: '', artist: '', duration: 0, publicationDate: 0 },
            message: null,
            messageType: 'success'
        }
    },
    methods: {
        authHeaders() {
            return { headers: { Authorization: `Bearer ${this.token}` } };
        },
        showMessage(text, type = 'success') {
            this.message = text;
            this.messageType = type;
            setTimeout(() => { this.message = null; }, 3000);
        },
        async login() {
            try {
                const res = await axios.post(AUTH, {
                    username: this.loginUsername,
                    password: this.loginPassword
                });
                this.token = res.data.token;
                localStorage.setItem('token', this.token);
                this.loginError = null;
                this.fetchRecords();
            } catch {
                this.loginError = 'Forkert brugernavn eller adgangskode';
            }
        },
        logout() {
            this.token = null;
            localStorage.removeItem('token');
            this.records = [];
        },
        async fetchRecords() {
            try {
                const res = await axios.get(API, {
                    params: {
                        title: this.searchTitle || undefined,
                        artist: this.searchArtist || undefined
                    }
                });
                this.records = res.data;
            } catch (error) {
                this.records = [];
                this.showMessage('Kunne ikke hente records: ' + (error.message || error), 'danger');
            }
        },
        handleError(error, fallbackMsg) {
            if (error.response?.status === 401) {
                this.logout();
                this.loginError = 'Din session er udløbet. Log ind igen.';
            } else {
                this.showMessage(fallbackMsg + (error.response?.data || error.message), 'danger');
            }
        },
        async addRecord() {
            try {
                await axios.post(API, this.newRecord, this.authHeaders());
                this.newRecord = { title: '', artist: '', duration: 0, publicationDate: 0 };
                this.showMessage('Record tilføjet!', 'success');
                this.fetchRecords();
            } catch (error) {
                this.handleError(error, 'Fejl ved tilføjelse: ');
            }
        },
        async deleteRecord(id) {
            if (!confirm('Er du sikker på at du vil slette denne record?')) return;
            try {
                await axios.delete(`${API}/${id}`, this.authHeaders());
                this.showMessage('Record slettet!', 'success');
                this.fetchRecords();
            } catch (error) {
                this.handleError(error, 'Fejl ved sletning: ');
            }
        },
        startEdit(record) {
            this.editingId = record.id;
            this.editRecord = { ...record };
        },
        async saveEdit(id) {
            try {
                await axios.put(`${API}/${id}`, this.editRecord, this.authHeaders());
                this.editingId = null;
                this.showMessage('Record opdateret!', 'success');
                this.fetchRecords();
            } catch (error) {
                this.handleError(error, 'Fejl ved opdatering: ');
            }
        }
    },
    mounted() {
        if (this.token) this.fetchRecords();
    }
}).mount('#app');
