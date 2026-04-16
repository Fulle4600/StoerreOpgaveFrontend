const { createApp } = Vue;

const API = 'http://localhost:5072/api/Music';

createApp({
    data() {
        return {
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
        showMessage(text, type = 'success') {
            this.message = text;
            this.messageType = type;
            setTimeout(() => { this.message = null; }, 3000);
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
        async addRecord() {
            try {
                await axios.post(API, this.newRecord);
                this.newRecord = { title: '', artist: '', duration: 0, publicationDate: 0 };
                this.showMessage('Record tilføjet!', 'success');
                this.fetchRecords();
            } catch (error) {
                this.showMessage('Fejl ved tilføjelse: ' + (error.response?.data || error.message), 'danger');
            }
        },
        async deleteRecord(id) {
            if (!confirm('Er du sikker på at du vil slette denne record?')) return;
            try {
                await axios.delete(`${API}/${id}`);
                this.showMessage('Record slettet!', 'success');
                this.fetchRecords();
            } catch (error) {
                this.showMessage('Fejl ved sletning: ' + (error.response?.data || error.message), 'danger');
            }
        },
        startEdit(record) {
            this.editingId = record.id;
            this.editRecord = { ...record };
        },
        async saveEdit(id) {
            try {
                await axios.put(`${API}/${id}`, this.editRecord);
                this.editingId = null;
                this.showMessage('Record opdateret!', 'success');
                this.fetchRecords();
            } catch (error) {
                this.showMessage('Fejl ved opdatering: ' + (error.response?.data || error.message), 'danger');
            }
        }
    },
    mounted() {
        this.fetchRecords();
    }
}).mount('#app');
