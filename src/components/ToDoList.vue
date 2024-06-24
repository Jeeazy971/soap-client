<template>
    <div>
        <h1>Liste des tâches</h1>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <ul>
            <li v-for="item in items" :key="item.Id">
                {{ item.Title }} - {{ item.User.Name }}
                <button @click="editItem(item.Id)">Modifier</button>
                <button @click="deleteItem(item.Id)">Supprimer</button>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { parseString } from 'xml2js';

export default defineComponent({
    name: 'ToDoList',
    data() {
        return {
            items: [] as Array<{ Id: number; Title: string; User: { Name: string } }>,
            error: null as string | null,
        };
    },
    created() {
        this.getToDoItems();
    },
    methods: {
        async getToDoItems() {
            const soapRequest = `
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <GetToDoItems xmlns="http://tempuri.org/" />
          </soap:Body>
        </soap:Envelope>`.trim();

            try {
                const response = await axios.post(
                    'https://localhost:32768/Service.svc',
                    soapRequest,
                    {
                        headers: {
                            'Content-Type': 'text/xml; charset=utf-8',
                            SOAPAction: 'http://tempuri.org/IService/GetToDoItems',
                        },
                    },
                );

                parseString(response.data, (err: any, result: any) => {
                    if (err) {
                        console.error(err);
                        this.error = 'Erreur de parsing des données des tâches';
                        return;
                    }
                    const items =
                        result['s:Envelope']['s:Body'][0]['GetToDoItemsResponse'][0][
                            'GetToDoItemsResult'
                        ][0]['d4p1:ToDoItem'];
                    if (items) {
                        this.items = items.map((item: any) => ({
                            Id: parseInt(item['d4p1:Id'][0]),
                            Title: item['d4p1:Title'][0],
                            User: {
                                Name: item['d4p1:User'][0]['d4p1:Name'][0],
                            },
                        }));
                    }
                });
            } catch (error) {
                console.error(error);
                this.error =
                    "La récupération des tâches n'est pas disponible pour le moment. Veuillez réessayer plus tard.";
            }
        },
        editItem(id: number) {
            this.$router.push({ name: 'EditToDo', params: { id } });
        },
        async deleteItem(id: number) {
            const soapRequest = `
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <DeleteToDoItem xmlns="http://tempuri.org/">
              <id>${id}</id>
            </DeleteToDoItem>
          </soap:Body>
        </soap:Envelope>`.trim();

            try {
                const response = await axios.post(
                    'https://localhost:32768/Service.svc',
                    soapRequest,
                    {
                        headers: {
                            'Content-Type': 'text/xml; charset=utf-8',
                            SOAPAction: 'http://tempuri.org/IService/DeleteToDoItem',
                        },
                    },
                );

                console.log(response.data);
                this.getToDoItems(); // Refresh the list after deletion
            } catch (error) {
                console.error(error);
                this.error =
                    "La suppression de la tâche n'est pas disponible pour le moment. Veuillez réessayer plus tard.";
            }
        },
    },
});
</script>
