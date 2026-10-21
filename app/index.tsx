import React, { useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Keyboard, Platform } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";

const HOME = "https://www.google.com";
function toUrl(value: string) {
  const q = value.trim();
  if (!q) return HOME;
  if (/^https?:\/\//i.test(q)) return q;
  if (/^[\w-]+\.[\w.-]+(?:\/.*)?$/.test(q) && !q.includes(" ")) return "https://" + q;
  return "https://www.google.com/search?q=" + encodeURIComponent(q);
}
export default function Home() {
  const [address, setAddress] = useState(HOME);
  const [input, setInput] = useState(HOME);
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const web = useRef<WebView>(null);
  const bg = dark ? "#0b1020" : "#f4f6fb";
  const panel = dark ? "#151d31" : "#ffffff";
  const fg = dark ? "#f5f7ff" : "#10182b";
  const go = () => { const url = toUrl(input); setAddress(url); setInput(url); Keyboard.dismiss(); };
  return <SafeAreaView style={[s.safe,{backgroundColor:bg}]}>
    <View style={s.top}>
      <View style={s.brandRow}><View style={s.logo}><Text style={s.logoText}>O</Text></View><View><Text style={[s.brand,{color:fg}]}>ORBIT</Text><Text style={[s.sub,{color:dark?"#9aa8c7":"#667085"}]}>PRIVATE • FAST • SIMPLE</Text></View><View style={{flex:1}}/><Pressable onPress={()=>setDark(!dark)} style={[s.theme,{backgroundColor:panel}]}><Text style={{color:fg,fontSize:18}}>{dark?"☼":"☾"}</Text></Pressable></View>
      <View style={[s.address,{backgroundColor:panel,borderColor:dark?"#29344e":"#e0e5ef"}]}>
        <Text style={{fontSize:16,color:"#7c8db2"}}>⌕</Text>
        <TextInput value={input} onChangeText={setInput} onSubmitEditing={go} returnKeyType="go" autoCapitalize="none" autoCorrect={false} placeholder="Search or enter website" placeholderTextColor={dark?"#8490aa":"#8b95a7"} style={[s.input,{color:fg}]} />
        <Pressable onPress={go} style={s.go}><Text style={{color:"white",fontWeight:"700"}}>GO</Text></Pressable>
      </View>
    </View>
    <View style={s.webWrap}><WebView ref={web} source={{uri:address}} onLoadStart={()=>setLoading(true)} onLoadEnd={()=>setLoading(false)} onNavigationStateChange={e=>{setAddress(e.url);setInput(e.url)}} javaScriptEnabled domStorageEnabled sharedCookiesEnabled startInLoadingState style={{flex:1,backgroundColor:bg}} /></View>
    <View style={[s.bottom,{backgroundColor:panel,borderColor:dark?"#29344e":"#e0e5ef"}]}>
      <Pressable onPress={()=>web.current?.goBack()} style={s.nav}><Text style={[s.navIcon,{color:fg}]}>‹</Text><Text style={[s.navLabel,{color:fg}]}>Back</Text></Pressable>
      <Pressable onPress={()=>web.current?.goForward()} style={s.nav}><Text style={[s.navIcon,{color:fg}]}>›</Text><Text style={[s.navLabel,{color:fg}]}>Forward</Text></Pressable>
      <Pressable onPress={()=>{setAddress(HOME);setInput(HOME)}} style={s.nav}><Text style={[s.navIcon,{color:fg}]}>⌂</Text><Text style={[s.navLabel,{color:fg}]}>Home</Text></Pressable>
      <Pressable onPress={()=>web.current?.reload()} style={s.nav}><Text style={[s.navIcon,{color:fg}]}>{loading?"◌":"↻"}</Text><Text style={[s.navLabel,{color:fg}]}>Reload</Text></Pressable>
    </View>
  </SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1},top:{paddingHorizontal:16,paddingTop:8,paddingBottom:12,gap:14},
 brandRow:{flexDirection:"row",alignItems:"center",gap:10},logo:{width:42,height:42,borderRadius:14,backgroundColor:"#6558f5",alignItems:"center",justifyContent:"center"},logoText:{fontSize:24,color:"white",fontWeight:"900"},brand:{fontSize:18,fontWeight:"900",letterSpacing:2},sub:{fontSize:9,letterSpacing:1.5,marginTop:2},theme:{width:42,height:42,borderRadius:14,alignItems:"center",justifyContent:"center"},
 address:{height:52,borderWidth:1,borderRadius:17,paddingLeft:14,paddingRight:5,flexDirection:"row",alignItems:"center",gap:9},input:{flex:1,fontSize:14,height:"100%"},go:{backgroundColor:"#6558f5",paddingHorizontal:15,paddingVertical:11,borderRadius:12},
 webWrap:{flex:1,overflow:"hidden"},bottom:{minHeight:66,borderTopWidth:1,flexDirection:"row",alignItems:"center",justifyContent:"space-around",paddingBottom:4},nav:{alignItems:"center",justifyContent:"center",minWidth:58,paddingVertical:4},navIcon:{fontSize:26,lineHeight:29},navLabel:{fontSize:10,fontWeight:"600"}
});