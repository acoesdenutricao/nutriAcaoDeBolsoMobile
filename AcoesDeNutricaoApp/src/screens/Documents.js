import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList} from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';

import Environment from '../config/environment.json';

export default function Documents({ navigation }) {
    const [categorias, setCategorias] = useState([]);
    const [categoriasLoading, setCategoriasLoading] = useState(true);

    //busca as categorias de documentos
    useEffect(() => {
        fetch(Environment.BASE_URL + '/document-categories', {
            method: 'GET',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())
            .then((json) => setCategorias(json))
            .catch((error) => console.error(error))
            .finally(() => setCategoriasLoading(false));
            console.log(categorias);
    }, []);

    return (
        <View>
            {categoriasLoading ?
                <View style={{ width: '100%', height: '100%', justifyContent: 'center' }}>
                    <ActivityIndicator size='large' />
                </View>
                :
                <View>
                    <FlatList
                        data={categorias}
                        keyExtractor={({ id }, index) => id.toString()}
                        renderItem={({ item }) => (
                            <Button style={styles.button} mode="contained" onPress={() => navigation.navigate('Referencias', {idCategoria: item.id, nomeCategoria: item.category})}>{item.category}</Button>
                        )}
                    />
                </View>
            }
        </View>
    )
}


const styles = StyleSheet.create({
    button: {
        marginTop: 12,
        marginHorizontal: 10,
        paddingVertical: 10,
        borderRadius: 4,
    },
})