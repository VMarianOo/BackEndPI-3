const map = L.map('map').setView([-23.5505, -46.6333], 13);
const markers = [];



L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

async function getSuggestions() {
    clearMarkers();
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
               // li.textContent = `${currentArrowColor.charAt(0).toUpperCase() + currentArrowColor.slice(1)}: Latitude ${latlng.lat}, Longitude ${latlng.lng}`;

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

                adicionarPontoAtivo = false;
                document.getElementById("adicionarPontoBtn").textContent = "Adicionar Ponto";
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

            removerPontoAtivo = false;
            document.getElementById("removerPontoBtn").textContent = "Remover Ponto";
        }

        function obterRota(lat, lng) {
            const openStreetMapURL = `https://www.openstreetmap.org/directions?from=&to=${lat}%2C${lng}#map=15/${lat}/${lng}`;
            window.open(openStreetMapURL, "_blank");
        }

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
        
              // Restante do código...
                } catch (error) {
                    console.error('Erro ao adicionar ponto:', error);
                }
            }

        function removerPontoDoMapa(_id) {

            // Adapte a URL para o seu servidor Spring Boot
            fetch(`http://localhost:8080/postos/${_id}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    console.log('Ponto removido com sucesso');
                    // Atualize o mapa ou a interface conforme necessário
                } else {
                    console.error('Erro ao remover ponto');
                }
            })
            .catch(error => {
                console.error('Erro ao remover ponto:', error);
            });
        }

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
                    alterarDescricaoAtivo = false;
                    document.getElementById("alterarDescricaoBtn").textContent = "Alterar Descrição";
                } else {
                    alterarDescricaoAtivo = true;
                    document.getElementById("alterarDescricaoBtn").textContent = "Clique no ponto para alterar descrição";
                }
            } else if (popupContent.includes("input")) {
                // Caso esteja editando uma descrição, manter o botão "Alterar Descrição"
                document.getElementById("alterarDescricaoBtn").textContent = "Alterar Descrição";
            }
        }

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
                    // Atualize o mapa ou a interface conforme necessário
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

            if (adicionarPontoBtn) {
                adicionarPontoBtn.addEventListener("click", () => {
                    if (!adicionarPontoAtivo) {
                        adicionarPontoAtivo = true;
                        removerPontoAtivo = false;
                        alterarDescricaoAtivo = false;
                        adicionarPontoBtn.textContent = "Clique no mapa para adicionar ponto";
                    }
                });
            }

            if (removerPontoBtn) {
                removerPontoBtn.addEventListener("click", () => {
                    if (!removerPontoAtivo) {
                        removerPontoAtivo = true;
                        adicionarPontoAtivo = false;
                        alterarDescricaoAtivo = false;
                        removerPontoBtn.textContent = "Clique no ponto para remover";
                    }
                });
            }

            if (alterarDescricaoBtn) {
                alterarDescricaoBtn.addEventListener("click", () => {
                    if (!alterarDescricaoAtivo) {
                        alterarDescricaoAtivo = Object.keys(markers).length > 0;
                        adicionarPontoAtivo = false;
                        removerPontoAtivo = false;
                        alterarDescricaoBtn.textContent = alterarDescricaoAtivo ? "Clique no ponto para alterar descrição" : "Não há descrição para alterar";
                    }
                });
            }
        }

        // Chame a função para adicionar ouvintes de eventos após o carregamento do DOM
        document.addEventListener('DOMContentLoaded', adicionarEventListeners);

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
        