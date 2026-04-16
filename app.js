const { createApp } = Vue;

createApp({
    data() {
        return {
            records: []
        }
    },
    methods: {
        async fetchRecords() {
            try {
                const res = await axios.get('http://localhost:5072/api/Music');
                this.records = res.data;
            } catch (error) {
                console.error('Fejl ved hentning af records:', error);
            }
        }
    },
    mounted() {
        this.fetchRecords();
    }
}).mount('#app');