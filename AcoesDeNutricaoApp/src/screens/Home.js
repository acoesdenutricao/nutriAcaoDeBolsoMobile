import React, { useState, useEffect, useLayoutEffect} from 'react';
import { StyleSheet, SafeAreaView, View, TouchableHighlight, ScrollView, FlatList } from 'react-native';
import { Avatar, Text, Button, Card, ActivityIndicator} from 'react-native-paper';
import MaterialTabs from 'react-native-material-tabs';
import NetInfo from "@react-native-community/netinfo";


import Historico from '../services/sqlite/Historico';
import Environment from '../config/environment.json';


export default function Home({ navigation, route }) {
    /*Armazena informação sobre a conexão com a Internet*/
    const [isConnected, setConected] = useState(false);

    /*Informa se os dados da API já estão carregados */
    const [isListaSujeitosLoading, setListaSujeitosLoading] = useState(true);
    const [isListaNiveisIntervencaoLoading, setListaNiveisIntervencaoLoading] = useState(true);
    const [isListaAcoesLoading, setListaAcoesLoading] = useState(true);

    /* Estado da tela inicial entre principal e histórico */
    const [selectedTab, setSelectedTab] = useState(0);

    /* id dos dados selecionados*/
    const [sujeitoAbordagem, setSujeitoAbordagem] = useState(0); //sujeito da abordagem selecionado
    const [nivelIntervencao, setNivelIntervencao] = useState(0); // nivel de intervencao selecionado
    const [selectedAcao, setSelectedAcao] = useState(0); // acao selecionada
    const [selectedAcaoName, setSelectedAcaoName] = useState(0); // acao selecionada

    /* Armazena as listas de informações */
    const [listaSujeitoAbordagem, setListaSujeitoAbordagem] = useState([]) // lista os sujeitos da abordagem
    const [listaNiveisIntervencao, setListaNiveisIntervencao] = useState([]) // lista os sujeitos da abordagem
    const [listaAcao, setListaAcao] = useState([]); // lista as acoes para o sujeito e nivel selecionados
    const [listaAcaoTemp, setListaAcaoTemp] = useState([]); // lista as acoes para o sujeito e nivel selecionados (versao temporaria da API)

    const [historico, setHistorico] = useState([]);

    function atualizaDadosSelecionados(sjtAbordagem, nvlIntervencao) {
        setListaAcao([]);
        setListaAcaoTemp([]);

        if (sjtAbordagem != 0) {
            setSujeitoAbordagem(sjtAbordagem);
            if (sjtAbordagem != 0 && nivelIntervencao != 0) {
                carregarDadosListaAcao(sjtAbordagem, nivelIntervencao);
            }
        }
        if (nvlIntervencao != 0) {
            setNivelIntervencao(nvlIntervencao);
            if (sujeitoAbordagem != 0 && nvlIntervencao != 0) {
                carregarDadosListaAcao(sujeitoAbordagem, nvlIntervencao);
            }
        }
    }

    //carrega todas as acoes correspondentes ao sujeito e nivel selecionados
    function carregarDadosListaAcao(sjtAbordagem, nvlIntervencao) {
        let requestURL = Environment.BASE_URL + "/information/" + sjtAbordagem + "/" + nvlIntervencao + "/categories"; //Armazena link responsável pela requisicao
        let request = new XMLHttpRequest(); //Instancia um objeto de solicitacao
        request.open('GET', requestURL);
        request.send();
        request.onload = function () {

            var dados = [];

            dadosAPI = JSON.parse(request.responseText);

            dadosAPI.map(function (item, indice) {
                item.information_categories.map(function (item, indice) {
                    let actionId = item.action_id;
                    dados.push({
                        id: actionId,
                        category_name: item.category_information_category.category
                    })
                })
            });

            setListaAcao(dados);
            setListaAcoesLoading(false);

        }
    }

    useEffect(() => {
        buscaHistorico();
    }, [])

    useLayoutEffect(() => {
        NetInfo.fetch().then(state => {
            console.log('Connection type', state.type);
            console.log('Is connected?', state.isConnected);
            console.log('Is internet connected?', state.isInternetReachable);
            if(state.isInternetReachable == true){
                setConected(true);
            }
          });
    }, [])

    function buscaHistorico() {
        Historico.all()
            .then(
                Historico => setHistorico(Historico)
            )
    }

    //busca sujeitos da abordagem
    useEffect(() => {
        fetch(Environment.BASE_URL + '/approach-subjects', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())
            .then((json) => setListaSujeitoAbordagem(json))
            .catch((error) => console.error(error))
            .finally(() => setListaSujeitosLoading(false));
    }, []);

    //busca niveis de intervencao
    useEffect(() => {
        fetch(Environment.BASE_URL + '/intervation-levels', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())
            .then((json) => setListaNiveisIntervencao(json))
            .catch((error) => console.error(error))
            .finally(() => setListaNiveisIntervencaoLoading(false));
    }, []);


    const ButtonGrid = (props) => {
        return (
            <TouchableHighlight
                style={styles.buttonGrid}
                activeOpacity={0.6}
                underlayColor="transparent"
                activeTextColor="white"
                onPress={() => atualizaDadosSelecionados(props.id, 0)}>
                <View style={{ alignItems: 'center' }}>
                    <Avatar.Icon style={{ backgroundColor: "transparent" }} color="#3c9891" size={50} icon={props.iconName} />
                    <Text style={{ color: "#3c9891" }}>{props.text}</Text>
                </View>
            </TouchableHighlight>
        );
    }

    const ButtonGridActive = (props) => {
        return (
            <TouchableHighlight
                style={styles.buttonGridActive}
                activeOpacity={0.6}
                underlayColor="#3c9891"
                onPress={() => atualizaDadosSelecionados(props.id, 0)}>
                <View style={{ alignItems: 'center' }}>
                    <Avatar.Icon style={{ backgroundColor: "transparent" }} color="white" size={50} icon={props.iconName} />
                    <Text style={{ color: 'white' }}>{props.text}</Text>
                </View>
            </TouchableHighlight>
        );
    }

    const ButtonTextGridNivelIntervencao = (props) => {
        return (
            <TouchableHighlight
                style={{
                    alignItems: 'center',
                    borderStyle: 'solid',
                    borderColor: props.color,
                    borderWidth: 2,
                    borderRadius: 4,
                    padding: 10,
                    margin: 5,
                    height: 75,
                    alignItems: "center",
                    flexGrow: 1,
                    flexBasis: 0,
                    textAlignVertical: 'center',
                    justifyContent: 'center'
                }}

                activeOpacity={0.6}
                underlayColor="transparent"
                onPress={() => atualizaDadosSelecionados(0, props.id)}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center', textAlignVertical: 'center', color: props.color }}>{props.text}</Text>
                </View>
            </TouchableHighlight>
        );
    }

    const ButtonTextGridNivelIntervencaoActive = (props) => {
        return (
            <TouchableHighlight
                style={{
                    alignItems: 'center',
                    borderStyle: 'solid',
                    borderColor: props.color,
                    backgroundColor: props.color,
                    borderWidth: 2,
                    borderRadius: 4,
                    padding: 10,
                    margin: 5,
                    height: 75,
                    alignItems: "center",
                    flexGrow: 1,
                    flexBasis: 0,
                    textAlignVertical: 'center',
                    justifyContent: 'center'
                }}
                activeOpacity={0.6}
                underlayColor="#3c9891"
                onPress={() => atualizaDadosSelecionados(0, props.id)}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center', color: 'white', textAlignVertical: 'center' }}>{props.text}</Text>
                </View>
            </TouchableHighlight>
        );
    }

    const ButtonTextGridAcao = (props) => {
        return (
            <TouchableHighlight
                style={styles.buttonTextGrid}
                activeOpacity={0.6}
                underlayColor="transparent"
                onPress={() => atualizaInfoAcaoSelecionada(props.id, props.text)}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center', color: "#3c9891" }}>{props.text}</Text>
                </View>
            </TouchableHighlight>
        );
    }

    const ButtonTextGridAcaoActive = (props) => {
        return (
            <TouchableHighlight
                style={styles.buttonTextGridActive}
                activeOpacity={0.6}
                underlayColor="#3c9891"
                onPress={() => atualizaInfoAcaoSelecionada(props.id, props.text)}>
                <View style={{ alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center', color: 'white' }}>{props.text}</Text>
                </View>
            </TouchableHighlight>
        );
    }

    //atualiza o nome e o id da ação que foi selecionada
    function atualizaInfoAcaoSelecionada(id, nome) {
        setSelectedAcao(id);
        setSelectedAcaoName(nome);
    }

    function mudaTab() {
        buscaHistorico();
        setSelectedTab(!selectedTab);
    }

    return (
        <View style={styles.container}>
            {/* Menu principal */}
            <SafeAreaView>
                <MaterialTabs
                    items={['Ações de Alimentação', 'Histórico']}
                    selectedIndex={selectedTab}
                    onChange={() => mudaTab()}
                    barColor='#f1f3f2'
                    indicatorColor='#3c9891' //verde oliva
                    activeTextColor='#3c9891' //verde oliva
                    inactiveTextColor='#3c9891' //verde oliva
                />
            </SafeAreaView>

            {selectedTab == 1 ? //Se selectTab for igual a histórico
                //Histórico
                <View style={styles.container}>
                    <FlatList
                        data={historico}
                        keyExtractor={({ id }, index) => id.toString()}
                        renderItem={({ item }) => (
                            <Card style={styles.card} onPress={() => navigation.navigate('InformationOffline', { informacao: item })}>
                                <Card.Content>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row' }}><Avatar.Icon style={{ backgroundColor: "transparent" }} color="#3c9891" size={40} icon={item.iconeSujeito} /><Text style={{ fontSize: 16, textAlignVertical: 'center', fontWeight: 'bold' }}>{item.nomeSujeito}</Text></View>
                                        <View style={{ flexDirection: 'row' }}><Text style={{ fontSize: 14, color: "grey", textAlignVertical: 'center' }}>{item.data}</Text></View>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row' }}><Avatar.Icon style={{ backgroundColor: "transparent" }} color={item.corIntervencao} size={40} icon="label" /><Text style={{ fontSize: 16, textAlignVertical: 'center' }}>{item.nomeIntervencao}</Text></View>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                        <View style={{ flexDirection: 'row' }}><Avatar.Icon style={{ backgroundColor: "transparent" }} color="#3c9891" size={40} icon="label" /><Text style={{ fontSize: 16, textAlignVertical: 'center' }}>{item.nomeAcao}</Text></View>
                                    </View>
                                </Card.Content>
                            </Card>
                        )}
                    />
                </View>

                :

                <View style={styles.container}>
                    {isConnected == false ?
                        <View style={{ width: '100%', height: '100%', justifyContent: 'center' }}>
                            <Text style={{ textAlign: 'center', fontWeight:'bold', color: '#3c9891', fontSize: 20 }}>Está desconectado da Internet?</Text>
                            <Text style={{ textAlign: 'center', fontSize: 15, marginHorizontal: 10}}>Você ainda poderá navegar pelo conteúdo salvo em histórico e favoritos</Text>
                        </View>
                        :
                        <></>
                    }
                    <View>
                        {/* Sujeito da abordagem */}
                        <Text style={styles.gridTitle}>Selecionar sujeito da Abordagem</Text>
                        {isListaSujeitosLoading ? <ActivityIndicator size='large' /> : (
                            <FlatList
                                data={listaSujeitoAbordagem}
                                keyExtractor={({ id }, index) => id.toString()}
                                numColumns={3}
                                renderItem={({ item }) => (
                                    sujeitoAbordagem == item.id ?
                                        <ButtonGridActive iconName={item.icon_name} text={item.subject} id={item.id}></ButtonGridActive>
                                        :
                                        <ButtonGrid iconName={item.icon_name} text={item.subject} id={item.id}></ButtonGrid>

                                )}
                            />
                        )}
                    </View>

                    <View>
                        {/* Nivel de Intervencao*/}
                        <Text style={styles.gridTitle}>Selecionar o nível de intervenção</Text>
                        {isListaNiveisIntervencaoLoading ? <ActivityIndicator size='large' /> : (
                            <FlatList
                                data={listaNiveisIntervencao}
                                keyExtractor={({ id }, index) => id.toString()}
                                numColumns={2}
                                renderItem={({ item }) => (
                                    nivelIntervencao == item.id ?
                                        <ButtonTextGridNivelIntervencaoActive color={item.color} text={item.title} id={item.id}></ButtonTextGridNivelIntervencaoActive>
                                        :
                                        <ButtonTextGridNivelIntervencao color={item.color} id={item.id} text={item.title}></ButtonTextGridNivelIntervencao>

                                )}
                            />
                        )}
                    </View>

                    {/* Selecão da ação*/}
                    <Text style={styles.gridTitle}>Selecionar Ação</Text>
                    <ScrollView>
                        {nivelIntervencao == 0 || sujeitoAbordagem == 0 ?
                            <Text style={{ textAlign: 'center', marginVertical: 75 }}>Selecione um sujeito da abordagem e um nivel de intervenção primeiro</Text>
                            :
                            isListaAcoesLoading ? <ActivityIndicator size='large' /> : (
                                <FlatList
                                    data={listaAcao}
                                    keyExtractor={({ id }, index) => id.toString()}
                                    numColumns={2}
                                    renderItem={({ item }) => (
                                        selectedAcao == item.id ?
                                            <ButtonTextGridAcaoActive text={item.category_name} id={item.id}></ButtonTextGridAcaoActive>
                                            :
                                            <ButtonTextGridAcao text={item.category_name} id={item.id}></ButtonTextGridAcao>
                                    )}
                                />)
                        }
                    </ScrollView>

                    <SafeAreaView style={{ padding: 10, backgroundColor: '#EBEDED' }}>
                        <Button mode="contained"
                            disabled={selectedAcao == 0}
                            onPress={() => navigation.navigate('Information',
                                { selectedAcao: selectedAcao, nomeAcao: selectedAcaoName, idSujeitoAbordagem: sujeitoAbordagem, idNivelIntervencao: nivelIntervencao }
                            )}>
                            Buscar
                        </Button>
                    </SafeAreaView>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 3,
        justifyContent: 'space-between'
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 50,
    },
    card: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        marginBottom: 5
    },
    grid: {
        margin: 5,
        flex: 1,
        flexDirection: 'row'
    },
    item: {
        alignItems: "center",
        backgroundColor: "#dcda48",
        flexGrow: 1,
        margin: 4,
        padding: 20,
        flexBasis: 0,
    },
    gridTitle: {
        marginTop: 10,
        marginLeft: 10,
        marginBottom: 10,
        alignSelf: 'flex-start',
    },
    buttonGrid: {
        shadowOpacity: 0.75,
        shadowRadius: 5,
        shadowColor: 'red',
        shadowOffset: { height: 5, width: 2 },
        borderStyle: 'solid',
        borderColor: '#3c9891',
        borderWidth: 2,
        borderRadius: 4,
        padding: 5,
        margin: 5,
        alignItems: "center",
        flexGrow: 1,
        flexBasis: 0,
    },

    buttonGridActive: {
        borderStyle: 'solid',
        borderColor: '#3c9891',
        backgroundColor: '#3c9891',
        borderWidth: 2,
        borderRadius: 4,
        padding: 5,
        margin: 5,
        alignItems: "center",
        flexGrow: 1,
        flexBasis: 0,
    },

    buttonTextGrid: {
        alignItems: 'center',
        borderStyle: 'solid',
        borderColor: '#3c9891',
        borderWidth: 2,
        borderRadius: 4,
        padding: 15,
        margin: 5,
        height: 70,
        alignItems: "center",
        flexGrow: 1,
        flexBasis: 0,
        justifyContent: 'center'
    },

    buttonTextGridActive: {
        alignItems: 'center',
        borderStyle: 'solid',
        borderColor: '#3c9891',
        backgroundColor: '#3c9891',
        borderWidth: 2,
        borderRadius: 4,
        padding: 15,
        margin: 5,
        height: 70,
        alignItems: "center",
        flexGrow: 1,
        flexBasis: 0,
        justifyContent: 'center'
    },
});