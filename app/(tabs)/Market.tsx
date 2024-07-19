import { router } from 'expo-router';
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const Marketplace = () => {
  const products = [
    { id: 1, title: 'Iphone 15 pro max 256 GB', price: 'GHS 2100.00', image: require('../../assets/assets/rectangle-61.png')},
    { id: 2, title: 'Iphone 15 pro max 256 GB', price: 'GHS 2100.00', image: require('../../assets/assets/rectangle-61.png')},
    { id: 3, title: 'Iphone 15 pro max 256 GB', price: 'GHS 2100.00', image: require('../../assets/assets/rectangle-61.png')},
    { id: 4, title: 'Iphone 15 pro max 256 GB', price: 'GHS 2100.00', image: require('../../assets/assets/rectangle-61.png')},
    { id: 5, title: 'Iphone 15 pro max 256 GB', price: 'GHS 2100.00', image: require('../../assets/assets/rectangle-61.png')},
    { id: 6, title: 'Iphone 15 pro max 256 GB', price: 'GHS 2100.00', image: require('../../assets/assets/rectangle-61.png')},
    { id: 7, title: 'Iphone 15 pro max 256 GB', price: 'GHS 2100.00', image: require('../../assets/assets/rectangle-61.png')},
    { id: 8, title: 'Iphone 15 pro max 256 GB', price: 'GHS 2100.00', image: require('../../assets/assets/rectangle-61.png')},
    // Add more products as needed
  ];

  return (
    <View style={{top: 30,backgroundColor: "#faf2f2",height: '100%'}}>
      <View style={{display: 'flex',flexDirection: 'row',justifyContent:'flex-end',gap:60,alignItems: 'center',marginRight:18}}>
      <Text style={styles.screenTitle}>Marketplace</Text>
      <TouchableOpacity onPress={()=> router.push("../SavedProducts")}>
      <Image source={require("../../assets/assets/group-4030.png")}   />
      </TouchableOpacity>
      </View>
      <View style={{display:'flex', flexDirection: "row", justifyContent: 'space-between',marginHorizontal: 20,marginBottom: 20}}>
        <View style={{backgroundColor: "#d4d4d4",padding: 5,height: 30,width: 70,borderRadius: 10,alignContent: 'center',justifyContent: 'center'}}>
          <Text style={{alignSelf: 'center'}}>For you</Text>
        </View>
        <View style={{backgroundColor: "#800000",padding: 5,height: 30,width: 60,borderRadius: 10,alignContent: 'center',justifyContent: 'center'}}>
          <Text style={{alignSelf: 'center',color: '#ffffff'}}>Sell</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>


      <Text style={styles.sectionTitle}>Electronics and Computers</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}> 
        {products.map((product) => (
          <TouchableOpacity key={product.id} style={styles.productCard} onPress={()=> router.push("../ProductDetails")}>
            <Image source={product.image} style={styles.productImage} />
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Clothes</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={product.image} style={styles.productImage} />
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.sectionTitle}>Tools</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={product.image} style={styles.productImage} />
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.sectionTitle}>Tools</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={product.image} style={styles.productImage} />
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.sectionTitle}>Tools</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={product.image} style={styles.productImage} />
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>
        ))}
      </ScrollView>
      <Text style={styles.sectionTitle}>Tools</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={product.image} style={styles.productImage} />
            <Text style={styles.productTitle}>{product.title}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>
        ))}
      </ScrollView>
      
    </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#faf2f2',
   
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    alignSelf: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  productCard: {
    width: 160,
    height: 180,
    marginRight: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: "#ffffff"
  },
  productImage: {
    borderRadius: 10,
    width: '95%',
    height: 110,
    marginTop: 3,
    resizeMode: 'cover',
  },
  productTitle: {
    fontSize: 14,
    marginVertical: 5,
  },
  productPrice: {
    fontSize: 14,
    color: 'black',
  },
});

export default Marketplace;



