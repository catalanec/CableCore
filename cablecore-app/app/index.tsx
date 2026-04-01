import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import tw from 'twrnc';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useCalculatorStore, CONFIG } from '../src/store/calculatorStore';

export default function CalculatorScreen() {
  const store = useCalculatorStore();

  const CABLE_TYPES = [
    { id: 'cat5', name: 'Cat 5e', price: CONFIG.cablePrices.cat5 },
    { id: 'cat6', name: 'Cat 6', price: CONFIG.cablePrices.cat6 },
    { id: 'cat6a', name: 'Cat 6A', price: CONFIG.cablePrices.cat6a },
    { id: 'cat7', name: 'Cat 7', price: CONFIG.cablePrices.cat7 },
  ] as const;

  const INSTALLATION_TYPES = [
    { id: 'external', name: 'Superficial (Canaleta)', icon: '📌' },
    { id: 'ceiling', name: 'Techo técnico', icon: '🏗️' },
    { id: 'existing_wall', name: 'Empotrado existente', icon: '🔩' },
    { id: 'new_wall', name: 'Empotrado nuevo', icon: '🧱' },
    { id: 'industrial', name: 'Industrial (Nave)', icon: '🏭' },
    { id: 'trays', name: 'Bandejas portacables', icon: '🔗' },
  ] as const;

  // Calculation logic replication for display
  const totalCableLength = store.points * store.avgLength;
  const cableCost = totalCableLength * CONFIG.cablePrices[store.cableType];
  
  let laborType: 'basic' | 'conduit' | 'advanced' = 'basic';
  if (['ceiling', 'existing_wall', 'trays'].includes(store.installType)) laborType = 'conduit';
  if (['new_wall', 'industrial'].includes(store.installType)) laborType = 'advanced';

  const laborCost = store.points * CONFIG.laborPerPoint[laborType] * CONFIG.cableMultiplier[store.cableType] * CONFIG.installationMultiplier[store.installType];
  const routingCost = totalCableLength * CONFIG.routingPricePerMeter[store.installType];
  
  let trenchCost = 0;
  if (store.installType === 'new_wall') {
    const len = store.trenchMode === 'full' ? totalCableLength : store.trenchLengthInput;
    trenchCost = len * CONFIG.trenchPricePerMeter;
  }

  let canetaCost = 0;
  if (store.installType === 'external') {
    const len = store.canetaMode === 'full' ? totalCableLength : store.canetaLengthInput;
    canetaCost = len * CONFIG.materials.trunking;
  }

  const materialsCost = store.points * ((2 * CONFIG.materials.keystone) + CONFIG.materials.socket);
  const subtotal = cableCost + routingCost + laborCost + trenchCost + canetaCost + materialsCost;
  
  let discountPercent = store.points >= 10 ? 10 : store.points >= 4 ? 5 : 0;
  const discount = subtotal * (discountPercent / 100);
  const afterUrgency = (subtotal - discount) * (store.urgency === 'urgente' ? 1.2 : store.urgency === 'weekend' ? 1.5 : 1.0);
  const iva = afterUrgency * CONFIG.IVA_RATE;
  const total = afterUrgency + iva;

  const generatePDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
              h1 { color: #CCAA6B; font-size: 28px; border-bottom: 2px solid #CCAA6B; padding-bottom: 10px; }
              .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .total { font-size: 24px; font-weight: bold; margin-top: 20px; text-align: right; color: #0A0D10; }
            </style>
          </head>
          <body>
            <h1>CableCore - Presupuesto de Instalación</h1>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <br/>
            <div class="row"><span>🔧 Puntos de Red (${store.points}) y Mano de obra</span><span>${laborCost.toFixed(2)} €</span></div>
            <div class="row"><span>🔌 Cable de Red (${store.cableType}) x ${totalCableLength}m</span><span>${cableCost.toFixed(2)} €</span></div>
            <div class="row"><span>🚧 Tendido y Canalización (${store.installType})</span><span>${(routingCost + trenchCost + canetaCost).toFixed(2)} €</span></div>
            <div class="row"><span>📦 Materiales (Rosetas, Keystones)</span><span>${materialsCost.toFixed(2)} €</span></div>
            ${discount > 0 ? `<div class="row"><span style="color:green">🎟️ Descuento (-${discountPercent}%)</span><span style="color:green">-${discount.toFixed(2)} €</span></div>` : ''}
            <br/>
            <div class="row"><span><strong>Subtotal</strong></span><span><strong>${(subtotal - discount).toFixed(2)} €</strong></span></div>
            <div class="row"><span>IVA (21%)</span><span>${iva.toFixed(2)} €</span></div>
            <div class="total">TOTAL ESTIMADO: ${total.toFixed(2)} €</div>
            <p style="margin-top: 50px; font-size: 12px; color: #777; text-align: center;">
              *Presupuesto orientativo sin valor contractual.
            </p>
          </body>
        </html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Compartir Presupuesto' });
      } else {
        Alert.alert('Error', 'Compartir no está disponible en este dispositivo');
      }
    } catch (err) {
      console.warn("PDF Generation Failed:", err);
      Alert.alert('Error', 'No se pudo generar el PDF');
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-[#0A0D10]`}>
      <ScrollView contentContainerStyle={tw`p-5 pb-20`}>
        
        <View style={tw`mb-8`}>
          <Text style={tw`text-[#CCAA6B] text-3xl font-bold text-center mb-1`}>CableCore</Text>
          <Text style={tw`text-gray-400 text-center text-sm`}>Calculadora de Instalación PRO</Text>
        </View>

        {/* Cable Type */}
        <View style={tw`bg-[#121415] border border-gray-800 rounded-2xl p-5 mb-5`}>
          <Text style={tw`text-white font-bold text-lg mb-4`}>🔌 Tipo de Cable</Text>
          <View style={tw`flex-row flex-wrap justify-between gap-y-3`}>
            {CABLE_TYPES.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => store.setCableType(c.id as any)}
                style={tw`w-[48%] p-3 rounded-lg border flex-col items-center ${
                  store.cableType === c.id ? 'bg-[#CCAA6B]/10 border-[#CCAA6B]' : 'bg-[#181A1C] border-gray-800'
                }`}
              >
                <Text style={tw`font-bold ${store.cableType === c.id ? 'text-[#CCAA6B]' : 'text-gray-300'}`}>{c.name}</Text>
                <Text style={tw`text-xs text-gray-500 mt-1`}>{c.price}€/m</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Network Points */}
        <View style={tw`bg-[#121415] border border-gray-800 rounded-2xl p-5 mb-5`}>
          <Text style={tw`text-white font-bold text-lg mb-1`}>📊 Puntos de red</Text>
          <Text style={tw`text-xs text-gray-500 mb-4`}>1 punto = 1 toma de internet</Text>
          
          <View style={tw`flex-row items-center justify-between`}>
            <TouchableOpacity onPress={() => store.setPoints(store.points - 1)} style={tw`bg-[#181A1C] border border-gray-800 w-12 h-12 rounded-lg items-center justify-center`}>
              <Text style={tw`text-white text-xl font-bold`}>-</Text>
            </TouchableOpacity>
            
            <Text style={tw`text-4xl font-bold text-[#CCAA6B]`}>{store.points}</Text>

            <TouchableOpacity onPress={() => store.setPoints(store.points + 1)} style={tw`bg-[#181A1C] border border-gray-800 w-12 h-12 rounded-lg items-center justify-center`}>
              <Text style={tw`text-white text-xl font-bold`}>+</Text>
            </TouchableOpacity>
          </View>
          {discountPercent > 0 && <Text style={tw`text-green-500 text-xs mt-3 text-center`}>🎉 Descuento aplicado: -{discountPercent}%</Text>}
        </View>

        {/* Average Length */}
        <View style={tw`bg-[#121415] border border-gray-800 rounded-2xl p-5 mb-5`}>
          <Text style={tw`text-white font-bold text-lg mb-1`}>📐 Longitud media por punto</Text>
          <Text style={tw`text-xs text-gray-500 mb-4`}>Total de cable: {totalCableLength}m</Text>
          
          <View style={tw`flex-row items-center justify-between`}>
            <TouchableOpacity onPress={() => store.setAvgLength(store.avgLength - 1)} style={tw`bg-[#181A1C] border border-gray-800 w-12 h-12 rounded-lg items-center justify-center`}>
              <Text style={tw`text-white text-xl font-bold`}>-</Text>
            </TouchableOpacity>
            
            <View style={tw`flex-row items-end`}>
              <Text style={tw`text-4xl font-bold text-[#CCAA6B]`}>{store.avgLength}</Text>
              <Text style={tw`text-lg text-[#CCAA6B] mb-1 ml-1`}>m</Text>
            </View>

            <TouchableOpacity onPress={() => store.setAvgLength(store.avgLength + 1)} style={tw`bg-[#181A1C] border border-gray-800 w-12 h-12 rounded-lg items-center justify-center`}>
              <Text style={tw`text-white text-xl font-bold`}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Installation Type */}
        <View style={tw`bg-[#121415] border border-gray-800 rounded-2xl p-5 mb-5`}>
          <Text style={tw`text-white font-bold text-lg mb-4`}>🔧 Tipo de Instalación</Text>
          <View style={tw`gap-y-3`}>
            {INSTALLATION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => store.setInstallType(type.id as any)}
                style={tw`flex-row items-center p-4 rounded-lg border ${
                  store.installType === type.id ? 'bg-[#CCAA6B]/10 border-[#CCAA6B]' : 'bg-[#181A1C] border-gray-800'
                }`}
              >
                <Text style={tw`text-2xl mr-3`}>{type.icon}</Text>
                <View>
                  <Text style={tw`font-bold ${store.installType === type.id ? 'text-[#CCAA6B]' : 'text-gray-300'}`}>{type.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* Floating Bottom Total Bar */}
      <View style={tw`absolute bottom-0 w-full bg-[#121415] border-t border-gray-800 p-5 px-6 pb-8 shadow-2xl flex-row justify-between items-center`}>
        <View>
          <Text style={tw`text-gray-400 text-xs uppercase tracking-wider mb-1`}>Total Estimado (+IVA)</Text>
          <Text style={tw`text-3xl font-bold text-white`}>{total.toFixed(2)}€</Text>
        </View>
        <TouchableOpacity onPress={generatePDF} style={tw`bg-[#CCAA6B] px-5 py-3 rounded-xl`}>
          <Text style={tw`text-[#0A0D10] font-bold text-sm text-center`}>Generar PDF</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
