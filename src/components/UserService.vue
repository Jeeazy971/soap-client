<template>
    <div>
        <h2>Liste des utilisateurs</h2>
        <div v-if="error" class="alert alert-danger">{{ error }}</div>
        <ul class="list-group">
            <li v-for="user in users" :key="user.Id" class="list-group-item">
                {{ user.Name }}
                <button
                    @click="editUser(user.Id)"
                    class="btn btn-primary btn-sm float-right ml-2"
                >
                    Modifier
                </button>
                <button
                    @click="deleteUser(user.Id)"
                    class="btn btn-danger btn-sm float-right"
                >
                    Supprimer
                </button>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { parseString } from 'xml2js';

export default defineComponent({
    name: 'UserService',
    data() {
        return {
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
        editUser(id: number) {
            this.$router.push({ name: 'EditUser', params: { id } });
        },
        async deleteUser(id: number) {
            const soapRequest = `
        <?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
          <soap:Body>
            <DeleteUser xmlns="http://tempuri.org/">
              <id>${id}</id>
            </DeleteUser>
          </soap:Body>
        </soap:Envelope>`.trim();

            try {
                const response = await axios.post(
                    'https://localhost:32768/UserService.svc',
                    soapRequest,
                    {
                        headers: {
                            'Content-Type': 'text/xml; charset=utf-8',
                            SOAPAction: 'http://tempuri.org/IUserService/DeleteUser',
                        },
                    },
                );

                console.log(response.data);
                this.getUsers(); // Refresh the list after deletion
            } catch (error) {
                console.error(error);
                this.error =
                    "La suppression de l'utilisateur n'est pas disponible pour le moment. Veuillez réessayer plus tard.";
            }
        },
    },
});
</script>
