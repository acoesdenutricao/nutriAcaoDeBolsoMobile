import React, { useState, useEffect} from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Appbar, Avatar, Button, Modal, Portal, ActivityIndicator } from 'react-native-paper';
import Favoritos from '../services/sqlite/Favoritos';
import Historico from '../services/sqlite/Historico';

import Environment from '../config/environment.json';

export default function Information({ navigation, route }) {

    const [visible, setVisible] = useState(false);
    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const [favorito, setFavorito] = useState(false);
    const [sujeitoAbordagem, setSujeitoAbordagem] = useState([]);
    const [nivelIntervencao, setNivelIntervencao] = useState([]);
    const [conteudoPuro, setConteudoPuro] = useState([]);
    const [registradoHistorico, setRegistradoHistorico] = useState(false);

    const containerStyle = { backgroundColor: 'white', padding: 20, margin: 15, borderRadius: 5 };

    const [informacao, setInformacao] = useState([]); // lista os sujeitos da abordagem
    const [informacaoLoading, setInformacaoLoading] = useState(true); // lista os sujeitos da abordagem

    //armazena as legendas
    const [legendaEspecifica, setLegendaEspecifica] = useState([]);
    const [legendaGeral, setLegendaGeral] = useState([]);

    //busca dados sobre o sujeito da abordagem selecionado
    useEffect(() => {
        let requestURL = Environment.BASE_URL + '/approach-subjects/' + route.params.idSujeitoAbordagem;
        let request = new XMLHttpRequest();

        request.open('GET', requestURL);
        request.send();
        request.onload = function () {
            setSujeitoAbordagem(JSON.parse(request.responseText));
        }
    }, [])

    //busca dados sobre o nivel de intervenção selecionado
    useEffect(() => {
        let requestURL = Environment.BASE_URL + '/intervation-levels/' + route.params.idNivelIntervencao;
        let request = new XMLHttpRequest();

        request.open('GET', requestURL);
        request.send();
        request.onload = function () {
            setNivelIntervencao(JSON.parse(request.responseText));
        }
    }, [])

    //Configurações da appbar
    useEffect(() => {
        navigation.setOptions({
            title: route.params.nomeAcao,
            headerRight: () => (
                <View style={{ flexDirection: 'row' }}>
                    <Appbar.Action icon="magnify" color="white" onPress={showModal} />
                    <Appbar.Action icon="help-circle-outline" color="white" onPress={showModal} />
                </View>
            ),
        });
    }, []);

    //busca conteudo da informacao
    useEffect(() => {
        let requestURL = Environment.BASE_URL + '/information/action/' + route.params.selectedAcao;
        let request = new XMLHttpRequest();

        request.open('GET', requestURL);
        request.send();
        request.onload = function () {
            let arrayTemp = [];
            let arrayDadosSplitados = [];
            JSON.parse(request.responseText).map(function (item, indice) {
                setConteudoPuro(item.category_information_actions.information);
                arrayTemp = item.category_information_actions.information.split(";");
            })


            let iterator = 0;
            arrayTemp.forEach(element => {
                iterator++;
                arrayDadosSplitados.push({
                    id: iterator,
                    information: element
                })
            });

            setInformacao(arrayDadosSplitados);
        }
        setInformacaoLoading(false);

    }, [])

    //identifica se esse conteudo está favoritado ou não
    useEffect(() => {
        Favoritos.findIdAcao(route.params.selectedAcao)
            .then(
                Favoritos => Favoritos != null ? setFavorito(true) : setFavorito(false)
            )
    }, [])

    //carrega a legenda correspondente ao conteúdo
    useEffect(() => {
        let requestURL = Environment.BASE_URL + '/actions/' + route.params.selectedAcao;
        let request = new XMLHttpRequest();

        request.open('GET', requestURL);
        request.send();
        request.onload = function () {
            arrayTratado = [];

            JSON.parse(request.responseText).map(function (item, indice) {
                item.subtitles.map(function (item, indice) {
                    arrayTratado.push({
                        id: item.id,
                        name: item.name,
                        meaning: item.meaning
                    })
                })
            })

            if (arrayTratado.length == 0) {
                setLegendaEspecifica(null)
            }
            else {
                setLegendaEspecifica(arrayTratado);
            }
        }
    }, [])

    //carrega a legenda geral
    useEffect(() => {
        let requestURL = Environment.BASE_URL + '/subtitles';
        let request = new XMLHttpRequest();

        request.open('GET', requestURL);
        request.send();
        request.onload = function () {
            setLegendaGeral(JSON.parse(request.responseText));
        }
    }, [])

    useEffect(() => {
        let dataAtual = getCurrentDate();
        let legendaEsp = "";
        let legendaGer = "";

        console.log(sujeitoAbordagem);
        console.log(nivelIntervencao);

        if(registradoHistorico == false && sujeitoAbordagem.subject != null && nivelIntervencao.title != null){
        Historico.create({ nomeSujeito: sujeitoAbordagem.subject, nomeIntervencao: nivelIntervencao.title, nomeAcao: route.params.nomeAcao, idAcao: route.params.selectedAcao, iconeSujeito: sujeitoAbordagem.icon_name, corIntervencao: nivelIntervencao.color, data: dataAtual, conteudo: conteudoPuro, legendaEspecifica: legendaEsp, legendaGeral: legendaGer })
            .then(id => console.log('Registrado no histórico com o id: ' + id))
            .catch(err => console.log(err))
            setRegistradoHistorico(true);
        }
    }, [informacaoLoading, legendaEspecifica, legendaGeral]);


    //calcula a data atual
    function getCurrentDate() {

        var date = new Date().getDate();
        var month = new Date().getMonth() + 1;
        var year = new Date().getFullYear();

        //Alert.alert(date + '-' + month + '-' + year);
        // You can turn it in to your desired format

        if (month < 10) {
            month = "0" + month;
        }
        return date + '/' + month + '/' + year;//format: dd-mm-yyyy;
    }

    function favoritar() {
        if (favorito == false) {
            //create
            let dataAtual = getCurrentDate();
            let legendaEsp = "";
            let legendaGer = "";

            //verifica se existe legendas, se não existir armazena uma string vazia
            if (legendaEspecifica == []) { legendaEsp = "" }
            if (legendaGeral == []) { legendaGer = "" }

            Favoritos.create({ nomeSujeito: sujeitoAbordagem.subject, nomeIntervencao: nivelIntervencao.title, nomeAcao: route.params.nomeAcao, idAcao: route.params.selectedAcao, iconeSujeito: sujeitoAbordagem.icon_name, corIntervencao: nivelIntervencao.color, data: dataAtual, conteudo: conteudoPuro, legendaEspecifica: legendaEsp, legendaGeral: legendaGer })
                .then(id => console.log('Favoritos criado com o id: ' + id))
                .catch(err => console.log(err))
            setFavorito(true);

        }
        else {
            Favoritos.removeIdAcao(route.params.selectedAcao);
            setFavorito(false);
        }
    }

    return (
        <View style={styles.container}>
            {informacaoLoading ? <View style={{ width: '100%', height: '100%', justifyContent: 'center' }}><ActivityIndicator size='large' /></View> :
                <View style={styles.container}>
                    {/*modal com as legendas*/}
                    <Portal>
                        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle} style={{ alignSelf: 'center' }}>
                            <View style={{ flexDirection: 'row', marginLeft: -10 }}>
                                <View style={{ flexDirection: 'row' }}><Avatar.Icon style={{ backgroundColor: "transparent", marginLeft: 0 }} color={nivelIntervencao.color} size={40} icon="label" /><Text style={{ fontSize: 14, textAlignVertical: 'center', fontWeight: 'bold' }}>{nivelIntervencao.title}</Text></View>
                            </View>
                            <View>
                                {legendaEspecifica == [] && legendaGeral == [] ? <Text>Nenhuma legenda disponível para esse conteúdo atualmente.</Text> : <></>}
                                {legendaGeral != [] && legendaEspecifica == null ?
                                    <View style={{ maxHeight: 500 }}>
                                        <FlatList
                                            data={legendaGeral}
                                            keyExtractor={({ id }, index) => id.toString()}
                                            renderItem={({ item }) => (
                                                <View>
                                                    <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                                                    <Text style={styles.text}>{item.meaning}</Text>
                                                </View>
                                            )}
                                        /></View>
                                    :
                                    <></>

                                }
                                {legendaEspecifica != [] ?
                                    <View style={{ maxHeight: 500 }}>
                                        <FlatList
                                            data={legendaEspecifica}
                                            keyExtractor={({ id }, index) => id.toString()}
                                            renderItem={({ item }) => (
                                                <View>
                                                    <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
                                                    <Text style={styles.text}>{item.meaning}</Text>
                                                </View>
                                            )}
                                        /></View>
                                    : <></>}
                            </View>
                            <Button style={{ marginVertical: 5, alignSelf: 'flex-end', width: 100 }} mode="contained" onPress={hideModal}>OK</Button>
                        </Modal>
                    </Portal>

                    {/*cabeçalho com dados a respeito da informação*/}
                    <View style={{ backgroundColor: '#EBEDED' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row' }}><Avatar.Icon style={{ backgroundColor: "transparent" }} color="#3c9891" size={40} icon={sujeitoAbordagem.icon_name} /><Text style={{ fontSize: 16, textAlignVertical: 'center' }}>{sujeitoAbordagem.subject}</Text></View>
                            {favorito ?
                                <View style={{ flexDirection: 'row' }}><TouchableOpacity onPress={favoritar}><Avatar.Icon style={{ backgroundColor: "transparent" }} color="#3c9891" size={40} icon="star" /></TouchableOpacity></View>
                                :
                                <View style={{ flexDirection: 'row' }}><TouchableOpacity onPress={favoritar}><Avatar.Icon style={{ backgroundColor: "transparent" }} color="#3c9891" size={40} icon="star-outline" /></TouchableOpacity></View>
                            }
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row' }}><Avatar.Icon style={{ backgroundColor: "transparent" }} color={nivelIntervencao.color} size={40} icon="label" /><Text style={{ fontSize: 16, textAlignVertical: 'center' }}>{nivelIntervencao.title}</Text></View>
                        </View>
                    </View>

                    {/*conteudo da informação*/}
                    <View style={styles.container}>
                        <FlatList
                            data={informacao}
                            keyExtractor={({ id }, index) => id.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.chapter}>
                                    <Text style={styles.number}>{item.id}</Text>
                                    <Text style={styles.text}>{item.information}</Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chapter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 0
    },
    number: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    text: {
        fontSize: 16,
        paddingLeft: 10,
        paddingRight: 10
    }
})