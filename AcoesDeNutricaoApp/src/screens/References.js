import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Linking } from 'react-native';
import { Text, Card, ActivityIndicator } from 'react-native-paper';

import Environment from '../config/environment.json';

export default function References({ navigation, route }) {
    const [links, setLinks] = useState([]);
    const [linksLoading, setLinksLoading] = useState(true);

    //busca as categorias de documentos
    useEffect(() => {
        fetch(Environment.BASE_URL + '/' + route.params.idCategoria + '/category-external-links', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())
            .then((json) => setLinks(json.category_external_links))
            .catch((error) => console.error(error))
            .finally(() => setLinksLoading(false));
    }, []);

    //Configurações da appbar
    useLayoutEffect(() => {
        navigation.setOptions({
            title: route.params.nomeCategoria,
        });
    }, []);

    return (
        <View style={styles.container}>
            {linksLoading ?
                <View style={{ width: '100%', height: '100%', justifyContent: 'center' }}>
                    <ActivityIndicator size='large' />
                </View>
                :
                <View>
                    <FlatList
                        data={links}
                        keyExtractor={({ id }, index) => id.toString()}
                        renderItem={({ item }) => (
                            <Card style={styles.card} onPress={()=>Linking.openURL(item.url)}>
                                <Card.Content>
                                    <Text style={{fontWeight: 'bold'}}>{item.name}</Text>
                                    <Text>{item.url}</Text>
                                </Card.Content>
                            </Card>
                        )}
                    />
                </View>
            }
        </View>

    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        marginBottom: 5
    },
})