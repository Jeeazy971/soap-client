<template>
    <div>
        <h2>Ajouter une tâche</h2>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <form @submit.prevent="addToDoItem">
            <div class="form-group">
                <label for="title">Titre</label>
                <input
                    v-model="title"
                    type="text"
                    class="form-control"
                    id="title"
                    required
                />
            </div>
            <div class="form-group">
                <label for="user">Utilisateur</label>
                <select v-model="userId" class="form-control" id="user" required>
                    <option v-for="user in users" :key="user.Id" :value="user.Id">
                        {{ user.Name }}
                    </option>
                </select>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="checkbox"
                    v-model="isCompleted"
                    id="isCompleted"
                />
                <label class="form-check-label" for="isCompleted"> Complété </label>
            </div>
            <button type="submit" class="btn btn-primary">Ajouter</button>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { parseString } from 'xml2js';

export default defineComponent({
    name: 'AddToDo',
    data() {
        return {
            title: '',
            userId: null,
            isCompleted: false,
            users: [] as Array<{ Id: number; Name: string }>,
            error: null as string | null,
        };
    },
    created() {
        this.getUsers();
    },
    methods: {
        async getUsers() {
            const soapRequest = `
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <GetUsers xmlns="http://tempuri.org/" />
          </soap:Body>
        </soap:Envelope>`.trim();

            try {
                const response = await axios.post(
                    'https://localhost:32768/UserService.svc',
                    soapRequest,
                    {
                        headers: {
                            'Content-Type': 'text/xml; charset=utf-8',
                            SOAPAction: 'http://tempuri.org/IUserService/GetUsers',
                        },
                    },
                );

                parseString(response.data, (err: any, result: any) => {
                    if (err) {
                        console.error(err);
                        this.error = 'Erreur de parsing des données des utilisateurs';
                        return;
                    }
                    const users =
                        result['s:Envelope']['s:Body'][0]['GetUsersResponse'][0][
                            'GetUsersResult'
                        ][0]['d4p1:User'];
                    if (users) {
                        this.users = users.map((user: any) => ({
                            Id: parseInt(user['d4p1:Id'][0]),
                            Name: user['d4p1:Name'][0],
                        }));
                    }
                });
            } catch (error) {
                console.error(error);
                this.error =
                    "La récupération des utilisateurs n'est pas disponible pour le moment. Veuillez réessayer plus tard.";
            }
        },
        async addToDoItem() {
            const newItem = {
                title: this.title,
                isCompleted: this.isCompleted,
                userId: this.userId,
            };

            const soapRequest = `
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <AddToDoItem xmlns="http://tempuri.org/">
              <item xmlns:d4p1="http://schemas.datacontract.org/2004/07/TodoListAppSOAP.Server.Models">
                <d4p1:Title>${newItem.title}</d4p1:Title>
                <d4p1:IsCompleted>${newItem.isCompleted}</d4p1:IsCompleted>
                <d4p1:UserId>${newItem.userId}</d4p1:UserId>
              </item>
            </AddToDoItem>
          </soap:Body>
        </soap:Envelope>`.trim();

            try {
                const response = await axios.post(
                    'https://localhost:32768/Service.svc',
                    soapRequest,
                    {
                        headers: {
                            'Content-Type': 'text/xml; charset=utf-8',
                            SOAPAction: 'http://tempuri.org/IService/AddToDoItem',
                        },
                    },
                );

                console.log(response.data);
                this.$router.push('/'); // Rediriger vers la page d'accueil après l'ajout
            } catch (error) {
                console.error(error);
                this.error =
                    "L'ajout de la tâche n'est pas disponible pour le moment. Veuillez réessayer plus tard.";
            }
        },
    },
});
</script>

<style scoped>
/* Ajustez le style pour le toggle switch */
.form-check-input {
    width: auto;
    height: auto;
    margin-left: 1rem;
}
</style>
