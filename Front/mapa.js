const map = L.map('map').setView([-23.5505, -46.6333], 13);
const markers = [];


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

async function getSuggestions() {
    const input = document.getElementById('addressInput').value;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${input}&countrycodes=BR&viewbox=-74.4482421875,-33.137551192346145,25.6640625,15.961329081596647`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        displaySuggestions(data);
    } catch (error) {
        console.error('Erro ao buscar sugestões', error);
    }
}

function displaySuggestions(suggestions) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '';
    suggestionsDiv.style.display = 'block';

    suggestions.forEach((suggestion) => {
        const suggestionItem = document.createElement('div');
        suggestionItem.textContent = suggestion.display_name;
        suggestionItem.addEventListener('click', () => {
            document.getElementById('addressInput').value = suggestion.display_name;
            suggestionsDiv.style.display = 'none';

            const lat = parseFloat(suggestion.lat);
            const lon = parseFloat(suggestion.lon);

            map.setView([lat, lon], 13);
            const marker = L.marker([lat, lon]).addTo(map);
            markers.push(marker);
        });

        suggestionsDiv.appendChild(suggestionItem);
    });
}

function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers.length = 0;
}

document.getElementById('addressInput').addEventListener('input', () => {
    getSuggestions();
});

document.getElementById('searchButton').addEventListener('click', () => {
    getSuggestions();
});
        const listaPontos = document.getElementById("listaPontos");
        let currentArrowColor = 'red';
        const arrowIcons = {
            red: L.icon({
                iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                shadowSize: [41, 41],
            })
        };

        let adicionarPontoAtivo = false;
        let removerPontoAtivo = false;
        let alterarDescricaoAtivo = false;
        let cursorMira;

        function adicionarMarcador(e) {
            if (adicionarPontoAtivo) {
                const arrowIcon = arrowIcons[currentArrowColor];
                const arrowMarker = L.marker(e.latlng, { icon: arrowIcon }).addTo(map);
                const latlng = arrowMarker.getLatLng();
                const li = document.createElement("li");

               listaPontos.appendChild(li);

                markers[arrowMarker._leaflet_id] = arrowMarker;

                arrowMarker.bindPopup(`
                    <div style="width: 200px;"> <!-- Ajuste a largura conforme necessário -->
                        <h3>Posto de abastecimento</h3>
                        <p>Nome: <input type="text" id="nome"></p>
                        <p>Endereço: <input type="text" id="endereco"></p>
                        <p>Horário de Funcionamento: <input type="text" id="horario"></p>
                        <button onclick="salvarDados(${arrowMarker._leaflet_id}, ${arrowMarker.getLatLng().lat},${arrowMarker.getLatLng().lng})">Salvar</button>
                        <button onclick="obterRota(${arrowMarker.getLatLng().lat},${arrowMarker.getLatLng().lng})">Ir até aqui</button>
                    </div>
                `);

                arrowMarker.on("click", () => {
                    if (removerPontoAtivo) {
                        removerMarcador(arrowMarker._leaflet_id);
                    } else if (alterarDescricaoAtivo) {
                        alterarDescricao(arrowMarker);
                    } else {
                        arrowMarker.openPopup();
                    }
                });

                var textoAdicionarPosto = "Adicionar Posto";
                var iconeAdicionarPosto = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" style="color: rgb(255,255,255);font-size: 25px;margin-right: 7px;">' +
                '<path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" fill="currentColor"></path>' +
                '<path fill-rule="evenodd" clip-rule="evenodd" d="M13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7V11H7C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13H11V17C11 17.5523 11.4477 18 12 18C12.5523 18 13 17.5523 13 17V13H17C17.5523 13 18 12.5523 18 12C18 11.4477 17.5523 11 17 11H13V7Z" fill="currentColor"></path>' +
                '</svg>';
                var adicionarPosto = iconeAdicionarPosto + textoAdicionarPosto;

                adicionarPontoAtivo = false;
                document.getElementById("adicionarPontoBtn").innerHTML = adicionarPosto;
                if (cursorMira) {
                    map.removeLayer(cursorMira);
                }
            }
        }

        function removerMarcador(markerId) {
            const markerToRemove = markers[markerId];
            map.removeLayer(markerToRemove);
            removerPontoDoMapa(markerId);


            const listItems = Array.from(listaPontos.getElementsByTagName('li'));
            const itemToRemove = listItems.find(li => li.textContent.includes(`Latitude ${markerToRemove.getLatLng().lat}, Longitude ${markerToRemove.getLatLng().lng}`));

            if (itemToRemove) {
                listaPontos.removeChild(itemToRemove);
            }

            delete markers[markerId];

            //Icone e texto do botão Remover
            var textoRemoverPosto = "Remover Posto";
            var iconeRemoverPosto = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" fill="none" style="color: rgb(255,255,255);font-size: 25px;margin-right: 4px;">' +
            '<path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" fill="currentColor"></path>' +
            '</svg>';
            var removerPosto = iconeRemoverPosto + textoRemoverPosto;

            removerPontoAtivo = false;
            document.getElementById("removerPontoBtn").innerHTML = removerPosto;
        }

        function obterRota(lat, lng) {
            const openStreetMapURL = `https://www.openstreetmap.org/directions?from=&to=${lat}%2C${lng}#map=15/${lat}/${lng}`;
            window.open(openStreetMapURL, "_blank");
        }

        // Adicionar posto ao banco de dados
        async function salvarDados(markerId, lat, lng) {

            var nome = document.getElementById('nome').value;
            var endereco = document.getElementById('endereco').value;
            var horario = document.getElementById('horario').value;
        
            try {
                const response = await fetch('http://localhost:8080/postos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "_id": markerId,
                        "nome": nome,
                        "endereco": endereco,
                        "horaFuncionamento": horario,
                        "latitude": lat,
                        "longitude": lng,
                    }),
                });
        
                  
        
                if (!response.ok) {
                    console.error('Erro ao adicionar ponto');
                    return;
                }
                
                console.log(await response.json())
                console.log('Ponto adicionado com sucesso');
        
                const markerToUpdate = markers[markerId];
        
                // Atualizar os dados do marcador
                markerToUpdate.setLatLng([lat, lng]);
        
                // Atualizar o conteúdo do popup
                const popupContent = `
                    <div>
                        <p>Nome: ${nome}</p>
                        <p>Endereço: ${endereco}</p>
                        <p>Horário de Funcionamento: ${horario}</p>
                        <button style="display: block; margin: 0 auto;" onclick="obterRota(${lat},${lng})">Ir até aqui</button>
                    </div>
                `;
                markerToUpdate.bindPopup(popupContent).openPopup();
        
                } catch (error) {
                    console.error('Erro ao adicionar ponto:', error);
                }
            }

        // Remover Posto do banco de dados    
        function removerPontoDoMapa(_id) {

            fetch(`http://localhost:8080/postos/${_id}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    console.log('Ponto removido com sucesso');

                } else {
                    console.error('Erro ao remover ponto');
                }
            })
            .catch(error => {
                console.error('Erro ao remover ponto:', error);
            });
        }

        // Editar Posto do banco de dados
        async function saveEditedData(_id, lat, lng) {
            
            var nomeEdit = document.getElementById('nomeEdit').value;
            var enderecoEdit = document.getElementById('enderecoEdit').value;
            var horarioEdit = document.getElementById('horarioEdit').value;

            await fetch(`http://localhost:8080/postos/${_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "nome": nomeEdit,
                    "endereco": enderecoEdit,
                    "horaFuncionamento": horarioEdit
                }),
            })
            .then(async (response) => {
                console.log(await response.json())
                if (response.ok) {
                    console.log('Ponto adicionado com sucesso');
                    
                } else {
                    console.error('Erro ao adicionar ponto');
                }
            })
            .catch(error => {
                console.error('Erro ao adicionar ponto:', error);
            });

            const markerToUpdate = markers[_id];
        
                // Atualizar os dados do marcador
                markerToUpdate.setLatLng([lat, lng]);
        
                // Atualizar o conteúdo do popup
                const popupContent = `
                    <div>
                        <p>Nome: ${nomeEdit}</p>
                        <p>Endereço: ${enderecoEdit}</p>
                        <p>Horário de Funcionamento: ${horarioEdit}</p>
                        <button style="display: block; margin: 0 auto;" onclick="obterRota(${lat},${lng})">Ir até aqui</button>
                    </div>
                `;
                markerToUpdate.bindPopup(popupContent).openPopup();
        }   
        
        // Trazer postos cadastrados do banco
        async function adicionarPostosCadastradosDoBanco() {
            try {
                const response = await fetch('http://localhost:8080/postos');
                if (!response.ok) {
                    console.error('Erro ao obter postos cadastrados');
                    return;
                }
        
                const postosCadastrados = await response.json();
        
                // Verifique se o mapa está definido antes de adicionar marcadores
                if (map) {
                    postosCadastrados.forEach(posto => {
                        const arrowIcon = arrowIcons[currentArrowColor];
                        const arrowMarker = L.marker([posto.latitude, posto.longitude], { icon: arrowIcon }).addTo(map);
                        const latlng = arrowMarker.getLatLng();
                        const li = document.createElement("li");
                        //li.textContent = `${currentArrowColor.charAt(0).toUpperCase() + currentArrowColor.slice(1)}: Latitude ${latlng.lat}, Longitude ${latlng.lng}`;
                        listaPontos.appendChild(li);
        
                        markers[arrowMarker._leaflet_id] = arrowMarker;
        
                        arrowMarker.bindPopup(`
                            <div>
                                <p>Nome: ${posto.nome}</p>
                                <p>Endereço: ${posto.endereco}</p>
                                <p>Horário de Funcionamento: ${posto.horaFuncionamento}</p>
                                <div style="text-align: center;"><button onclick="obterRota(${latlng.lat},${latlng.lng})">Ir até aqui</button></div>
                            </div>
                        `);
        
                        arrowMarker.on("click", () => {
                            if (removerPontoAtivo) {
                                removerMarcador(arrowMarker._leaflet_id);
                            } else if (alterarDescricaoAtivo) {
                                alterarDescricao(arrowMarker);
                            } else {
                                arrowMarker.openPopup();
                            }
                        });
                    });
                } else {
                    console.error("O mapa não está definido. Certifique-se de que o mapa está sendo inicializado corretamente.");
                }
            } catch (error) {
                console.error('Erro ao obter postos cadastrados:', error);
            }
        }
        
        // Chame a função para adicionar postos cadastrados imediatamente após a inicialização do mapa
        adicionarPostosCadastradosDoBanco();

        function alterarDescricao(marker) {
            const popupContent = marker.getPopup().getContent();

            if (!popupContent.includes("input") && !removerPontoAtivo && !adicionarPontoAtivo) {
                if (alterarDescricaoAtivo) {
                    const nomeEdit = popupContent.match(/<p>Nome: (.*?)<\/p>/)[1];
                    const enderecoEdit = popupContent.match(/<p>Endereço: (.*?)<\/p>/)[1];
                    const horarioEdit = popupContent.match(/<p>Horário de Funcionamento: (.*?)<\/p>/)[1];

                    const updatedContent = `
                        <p>Nome: <input type="text" id="nomeEdit" value="${nomeEdit}"></p>
                        <p>Endereço: <input type="text" id="enderecoEdit" value="${enderecoEdit}"></p>
                        <p>Horário de Funcionamento: <input type="text" id="horarioEdit" value="${horarioEdit}"></p>
                        <button onclick="saveEditedData(${marker._leaflet_id}, ${marker.getLatLng().lat},${marker.getLatLng().lng})">Salvar Edições</button>
                        <button onclick="obterRota(${marker.getLatLng().lat},${marker.getLatLng().lng})">Ir até aqui</button>
                    `;
                    

                    marker.setPopupContent(updatedContent);
                    const alterarDescricaoBtn = document.getElementById("alterarDescricaoBtn");
                    //Icone e texto do botão Editar
                    var textoEditarPosto = "Editar Posto";
                    var iconeEditarPosto = "<svg xmlns=\"http://www.w3.org/2000/svg\" enable-background=\"new 0 0 24 24\" height=\"1em\" viewBox=\"0 0 24 24\" width=\"1em\" fill=\"currentColor\" style=\"color: rgb(255,255,255);font-size: 25px;margin-right: 7px;\"><g><rect fill=\"none\" height=\"24\" width=\"24\"></rect></g><g><circle cx=\"19\" cy=\"5\" r=\"3\"></circle><path d=\"M10.76 9.24 15 5 10.76.76 9.34 2.17 11.17 4H7.82C7.4 2.84 6.3 2 5 2 3.34 2 2 3.34 2 5c0 1.3.84 2.4 2 2.82v8.37C2.84 16.6 2 17.7 2 19c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.3-.84-2.4-2-2.82V7.82c.85-.31 1.51-.97 1.82-1.82h3.36L9.34 7.83l1.42 1.41z\"></path><polygon points=\"10,19 10,22 13,22 19.26,15.74 16.26,12.74\"></polygon><path d=\"M20.12 10.29c-.39-.39-1.02-.39-1.41 0l-1.38 1.38 3 3 1.38-1.38c.39-.39.39-1.02 0-1.41l-1.59-1.59z\"></path></g></svg>";
                    var editarPosto = iconeEditarPosto + textoEditarPosto;

                    alterarDescricaoAtivo = false;
                    alterarDescricaoBtn.innerHTML = editarPosto;
                } else {
                    alterarDescricaoAtivo = true;
                    document.getElementById("alterarDescricaoBtn").innerHTML = "Clique em um posto para alterar sua descrição";
                }
            } else if (popupContent.includes("input")) {
                // Caso esteja editando uma descrição, manter o botão "Alterar Descrição"
                const alterarDescricaoBtn = document.getElementById("alterarDescricaoBtn");
                //Icone e texto do botão Editar
                var textoEditarPosto = "Editar Posto";
                var iconeEditarPosto = "<svg xmlns=\"http://www.w3.org/2000/svg\" enable-background=\"new 0 0 24 24\" height=\"1em\" viewBox=\"0 0 24 24\" width=\"1em\" fill=\"currentColor\" style=\"color: rgb(255,255,255);font-size: 25px;margin-right: 7px;\"><g><rect fill=\"none\" height=\"24\" width=\"24\"></rect></g><g><circle cx=\"19\" cy=\"5\" r=\"3\"></circle><path d=\"M10.76 9.24 15 5 10.76.76 9.34 2.17 11.17 4H7.82C7.4 2.84 6.3 2 5 2 3.34 2 2 3.34 2 5c0 1.3.84 2.4 2 2.82v8.37C2.84 16.6 2 17.7 2 19c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.3-.84-2.4-2-2.82V7.82c.85-.31 1.51-.97 1.82-1.82h3.36L9.34 7.83l1.42 1.41z\"></path><polygon points=\"10,19 10,22 13,22 19.26,15.74 16.26,12.74\"></polygon><path d=\"M20.12 10.29c-.39-.39-1.02-.39-1.41 0l-1.38 1.38 3 3 1.38-1.38c.39-.39.39-1.02 0-1.41l-1.59-1.59z\"></path></g></svg>";
                var editarPosto = iconeEditarPosto + textoEditarPosto;
                alterarDescricaoBtn.innerHTML = editarPosto;
            }
        }

        map.on('click', adicionarMarcador);

        map.on('mousemove', (e) => {
            if (adicionarPontoAtivo) {
                if (cursorMira) {
                    map.removeLayer(cursorMira);
                }
                cursorMira = L.marker(e.latlng, { icon: arrowIcons[currentArrowColor] }).addTo(map);
            }
        });

        // Função para adicionar ouvintes de eventos aos botões, verificando se os elementos existem
        function adicionarEventListeners() {
            const adicionarPontoBtn = document.getElementById("adicionarPontoBtn");
            const removerPontoBtn = document.getElementById("removerPontoBtn");
            const alterarDescricaoBtn = document.getElementById("alterarDescricaoBtn");
            
            //Icone e texto do botão Editar
            var textoEditarPosto = "Editar Posto";
            var iconeEditarPosto = "<svg xmlns=\"http://www.w3.org/2000/svg\" enable-background=\"new 0 0 24 24\" height=\"1em\" viewBox=\"0 0 24 24\" width=\"1em\" fill=\"currentColor\" style=\"color: rgb(255,255,255);font-size: 25px;margin-right: 7px;\"><g><rect fill=\"none\" height=\"24\" width=\"24\"></rect></g><g><circle cx=\"19\" cy=\"5\" r=\"3\"></circle><path d=\"M10.76 9.24 15 5 10.76.76 9.34 2.17 11.17 4H7.82C7.4 2.84 6.3 2 5 2 3.34 2 2 3.34 2 5c0 1.3.84 2.4 2 2.82v8.37C2.84 16.6 2 17.7 2 19c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.3-.84-2.4-2-2.82V7.82c.85-.31 1.51-.97 1.82-1.82h3.36L9.34 7.83l1.42 1.41z\"></path><polygon points=\"10,19 10,22 13,22 19.26,15.74 16.26,12.74\"></polygon><path d=\"M20.12 10.29c-.39-.39-1.02-.39-1.41 0l-1.38 1.38 3 3 1.38-1.38c.39-.39.39-1.02 0-1.41l-1.59-1.59z\"></path></g></svg>";
            var editarPosto = iconeEditarPosto + textoEditarPosto;

            //Icone e texto do botão Remover
            var textoRemoverPosto = "Remover Posto";
            var iconeRemoverPosto = '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20" fill="none" style="color: rgb(255,255,255);font-size: 25px;margin-right: 4px;">' +
            '<path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM8.70711 7.29289C8.31658 6.90237 7.68342 6.90237 7.29289 7.29289C6.90237 7.68342 6.90237 8.31658 7.29289 8.70711L8.58579 10L7.29289 11.2929C6.90237 11.6834 6.90237 12.3166 7.29289 12.7071C7.68342 13.0976 8.31658 13.0976 8.70711 12.7071L10 11.4142L11.2929 12.7071C11.6834 13.0976 12.3166 13.0976 12.7071 12.7071C13.0976 12.3166 13.0976 11.6834 12.7071 11.2929L11.4142 10L12.7071 8.70711C13.0976 8.31658 13.0976 7.68342 12.7071 7.29289C12.3166 6.90237 11.6834 6.90237 11.2929 7.29289L10 8.58579L8.70711 7.29289Z" fill="currentColor"></path>' +
            '</svg>';
            var removerPosto = iconeRemoverPosto + textoRemoverPosto;

            if (adicionarPontoBtn) {
                adicionarPontoBtn.addEventListener("click", () => {
                    if (!adicionarPontoAtivo) {
                        adicionarPontoAtivo = true;
                        removerPontoAtivo = false;
                        alterarDescricaoAtivo = false;
                        adicionarPontoBtn.innerHTML = "Clique no mapa para adicionar um posto";
                        alterarDescricaoBtn.innerHTML = editarPosto;
                        removerPontoBtn.innerHTML = removerPosto;
                    }
                });
            }

            if (removerPontoBtn) {
                removerPontoBtn.addEventListener("click", () => {
                    if (!removerPontoAtivo) {
                        removerPontoAtivo = Object.keys(markers).length > 0;
                        adicionarPontoAtivo = false;
                        alterarDescricaoAtivo = false;
                        removerPontoBtn.textContent = removerPontoAtivo ? "Clique no ponto para remover" : "Não existem postos no mapa para serem editados";
                    }
                });
            }

            if (alterarDescricaoBtn) {
                alterarDescricaoBtn.addEventListener("click", () => {
                    if (!alterarDescricaoAtivo) {
                        alterarDescricaoAtivo = Object.keys(markers).length > 0;
                        adicionarPontoAtivo = false;
                        removerPontoAtivo = false;
                        alterarDescricaoBtn.textContent = alterarDescricaoAtivo ? "Clique no ponto para alterar descrição" : "Não existem postos no mapa";
                    }
                });
            }
        }

        // Chame a função para adicionar ouvintes de eventos após o carregamento do DOM
        document.addEventListener('DOMContentLoaded', adicionarEventListeners);        