import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Appbar, Avatar, Button, Modal, Portal, ActivityIndicator } from 'react-native-paper';

export default function InformationOffline({ navigation, route }) {
    const [visible, setVisible] = useState(false);
    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);

    const containerStyle = { backgroundColor: 'white', padding: 20, margin: 15, borderRadius: 5 };

    const [informacaoLoading, setInformacaoLoading] = useState(true);

    const [informacao, setInformacao] = useState([]);
    const [conteudo, setConteudo] = useState([]);

    useEffect(() => {
        setInformacao(route.params.informacao);
        carregarConteudo(route.params.informacao.conteudo);
        setInformacaoLoading(false);
    }, [])

    function carregarConteudo(conteudo) {
        let arrayTemp = [];
        let arrayDadosSplitados = [];
        let iterator = 0;

        arrayTemp = conteudo.split(";");

        arrayTemp.forEach(element => {
            iterator++;
            arrayDadosSplitados.push({
                id: iterator,
                information: element
            })
        });

        setConteudo(arrayDadosSplitados);
    }

    return (
        <View style={styles.container}>
            {informacaoLoading ? <View style={{ width: '100%', height: '100%', justifyContent: 'center' }}><ActivityIndicator size='large' /></View> :
                <View style={styles.container}>
                    {/*modal com as legendas*/}
                    <Portal>
                        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
                            <View style={{ flexDirection: 'row', marginLeft: -10 }}>
                                <View style={{ flexDirection: 'row' }}><Avatar.Icon style={{ backgroundColor: "transparent", marginLeft: 0 }} color={informacao.corIntervencao} size={40} icon="label" /><Text style={{ fontSize: 14, textAlignVertical: 'center', fontWeight: 'bold' }}>{informacao.nomeIntervencao}</Text></View>
                            </View>
                            <View>
                                {informacao.legendaEspecifica == [] && informacao.legendaGeral == [] ? <Text>Legenda disponível</Text> : <Text>Nenhuma legenda disponível para esse conteúdo atualmente.</Text>}
                            </View>
                            <Button style={{ marginVertical: 5, alignSelf: 'flex-end', width: 100 }} mode="contained" onPress={hideModal}>OK</Button>
                        </Modal>
                    </Portal>

                    {/*cabeçalho com dados a respeito da informação*/}
                    <View style={{ backgroundColor: '#EBEDED' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row' }}><Avatar.Icon style={{ backgroundColor: "transparent" }} color="#3c9891" size={40} icon={informacao.iconeSujeito} /><Text style={{ fontSize: 16, textAlignVertical: 'center' }}>{informacao.nomeSujeito}</Text></View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row' }}><Avatar.Icon style={{ backgroundColor: "transparent" }} color={informacao.corIntervencao} size={40} icon="label" /><Text style={{ fontSize: 16, textAlignVertical: 'center' }}>{informacao.nomeIntervencao}</Text></View>
                        </View>
                    </View>

                    {/*conteudo da informação*/}
                    <View style={styles.container}>
                        <Text style={{ color: "red", textAlign: "center", marginTop: 5, marginBottom: 5 }}>Esse conteúdo pode estar desatualizado</Text>
                        <FlatList
                            data={conteudo}
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