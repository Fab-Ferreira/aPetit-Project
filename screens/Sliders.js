import { useCallback, useState } from 'react';
import { View, StyleSheet, BackHandler, Alert, Image, Text, Dimensions, Modal, ScrollView, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
//import Checkbox from 'expo-checkbox';

const slides = [
    {
        key: '1',
        title: 'Bem-vindo(a) ao aPetit  szxdjvdkxrtdb',
        text: 'Seja bem-vindo(a) ao aplicativo aPetit. Aqui você irá satisfazer o apetite do seu pet!',
        image: require('../assets/Images/aPetitLogoCut.png')
    },

    {
        key: '2',
        title: 'Conecte-se com o dispenser via Bluetooth', 
        text: 'Ative sua conexão Bluetooth para poder alimentar o seu pet.', 
        image: require('../assets/Images/Slider/img1.png'),
        logo: require('../assets/Images/aPetitLogoCut.png')
    },

    {
        key: '3',
        title: 'Adicione o seu Pet',
        text: 'Insira as informação do seu animal de estimação dentro do aplicativo.',
        image: require('../assets/Images/Slider/img2.png'),
        logo: require('../assets/Images/aPetitLogoCut.png')
    },

    {
        key: '4',
        title: 'Configure a refeição',
        text: 'Defina a quantidade e o(s) horário(s) para alimentar o seu pet.',
        image: require('../assets/Images/Slider/img3.png'),
        logo: require('../assets/Images/aPetitLogoCut.png')
    },

    {
        key: '5',
        title: 'Alimente quando quiser',
        text: 'Configure para alimentar o seu pet na hora que quiser.',
        image: require('../assets/Images/Slider/img4.png'),
        logo: require('../assets/Images/aPetitLogoCut.png')
    },

    {
        key: '6',
        title: 'Comece a explorar!',
        text: 'Desfrute de todas as funcionalidades que projetamos para tornar sua vida mais simples e eficiente.',
        image: require('../assets/Images/aPetitLogoCut.png')
    }
];

export default function Sliders({navigation}){

    const[showModal, setShowModal] = useState(false);
    const[isChecked, setIsChecked] = useState(false);

    const backAction = () => {
        Alert.alert(
            'Aviso!',
            'Tem certeza que deseja sair da sua conta?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },

                {
                    text: 'Sair',
                    onPress: ()=> BackHandler.exitApp()
                }
            ],
            {
                cancelable: true
            }
        );
        return true;
    };

    useFocusEffect(
        useCallback(()=>{
            BackHandler.addEventListener('hardwareBackPress', backAction);

            return(()=>{
                BackHandler.removeEventListener('hardwareBackPress', backAction);
            })
        },[])
    );

    const checkBox = () => {
        return(
            <TouchableOpacity style={styles.checkBox} onPress={()=>setIsChecked(!isChecked)}>
                {isChecked? (
                    <View style={styles.checkBoxColor}>
                        <MaterialCommunityIcons name='check' size={17} color='white'/>
                    </View>
                ):(<View/>)}
            </TouchableOpacity>
        )
    }

    const agreeWithTerms = () => {
        if(isChecked){
            navigation.navigate('Access');
            setShowModal(false);
        }
        else {
            Alert.alert(
                'Concorde com os Termos de Uso',
                'Para prosseguir, você precisa concordar com os Termos de Uso e Política de Segurança.',
                [
                    {
                        text: 'OK',
                        style: 'cancel'
                    }
                ],
                {
                    cancelable: true
                }
            )
        }
    }

    const renderSlides = ({item}) => {
        if(item.key === '1' || item.key === '6') {
            return(
                <View style={styles.container}>
                    <Image source={item.image} style={[styles.image, {width: 250, height: 150}]}/>
                    <Text style={styles.openingTitle}>
                        {item.title}
                    </Text>
                    
                    <Text style={styles.openingMessage}>{item.text}</Text>
                </View>
            )
        }
        else {
            return(
                <View style={styles.container}>
                    <Image source={item.logo} style={styles.logoApetit}/>
                    <Text style={styles.openingTitle}>
                        {item.title}
                    </Text>
                    
                    <Text style={styles.openingMessage}>{item.text}</Text>

                    <Image source={item.image}
                        style={[styles.image, 
                            item.key === '2'? 
                                {width: 300, height: 300} : {width: 250, height: 330}]}
                    />
                </View>
            )
        }
    }

    return(
        <View style={{flex: 1}}>
            <AppIntroSlider
                renderItem={renderSlides}
                data={slides}
                activeDotStyle={{
                    backgroundColor: '#ff9b4f',
                    width: 15
                }}
                onDone={()=>setShowModal(true)}
                renderNextButton={()=>
                    <MaterialCommunityIcons color='#ff9b4f' size={33} name='arrow-right-circle'/>
                }
                renderDoneButton={()=>
                    <MaterialCommunityIcons color='#ff9b4f' size={33} name='check-circle'/>
                }
                renderPrevButton={()=>
                    <MaterialCommunityIcons color='#ff9b4f' size={33} name='arrow-left-circle'/>
                }
                showPrevButton={true}
            />

            <Modal transparent={true} visible={showModal} animationType='fade'>
                <View style={styles.modalContainer}>
                    <View style={styles.modalBackground}/>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Termos de Uso</Text>
                        <View style={styles.terms}>
                            <ScrollView>
                                <Text style={[styles.termsText, {flexDirection: 'row'}]}>
                                    Os serviços do Apetit são fornecidos pela pessoa jurídica OU física com a
                                    seguinte Razão Social/nome: Pata Amiga ltda, com nome fantasia Apetit, inscrito no
                                    CNPJ/CPF sob o nº ___, titular da propriedade intelectual sobre software, website,
                                    aplicativos, conteúdos e demais ativos relacionados à plataforma Apetit. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>1) Do objeto</Text> {'\n'}
                                    A plataforma visa licenciar o uso de seu software, website, aplicativos e demais
                                    ativos de propriedade intelectual, fornecendo ferramentas para auxiliar e dinamizar o
                                    dia a dia dos seus usuários.
                                    A plataforma caracteriza-se pela prestação do seguinte serviço: Alimentador
                                    Automatizado para Pets.
                                    A plataforma realiza a venda à distância por meio eletrônico dos seguintes
                                    produtos ou serviços: Comedouro Apetit. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>2) Da aceitação</Text> {'\n'}
                                    O presente Termo estabelece obrigações contratadas de livre e espontânea
                                    vontade, por tempo indeterminado, entre a plataforma e as pessoas físicas ou
                                    jurídicas, usuárias do OU site OU aplicativo.
                                    Ao utilizar a plataforma o usuário aceita integralmente as presentes normas e
                                    compromete-se a observá-las, sob o risco de aplicação das penalidades cabíveis.
                                    A aceitação do presente instrumento é imprescindível para o acesso e para a
                                    utilização de quaisquer serviços fornecidos pela empresa. Caso não concorde com as
                                    disposições deste instrumento, o usuário não deve utilizá-los. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>3) Do acesso dos usuários</Text> {'\n'}
                                    Serão utilizadas todas as soluções técnicas à disposição do responsável pela
                                    plataforma para permitir o acesso ao serviço 24 (vinte e quatro) horas por dia, 7 (sete)
                                    dias por semana. No entanto, a navegação na plataforma ou em alguma de suas
                                    páginas poderá ser interrompida, limitada ou suspensa para atualizações,
                                    modificações ou qualquer ação necessária ao seu bom funcionamento. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>4) Do cadastro</Text> {'\n'}
                                    104
                                    O acesso às funcionalidades da plataforma exigirá a realização de um cadastro
                                    prévio e, a depender dos serviços ou produtos escolhidos, o pagamento de
                                    determinado valor.
                                    Ao se cadastrar o usuário deverá informar dados completos, recentes e válidos,
                                    sendo de sua exclusiva responsabilidade manter referidos dados atualizados, bem
                                    como o usuário se compromete com a veracidade dos dados fornecidos.
                                    O usuário se compromete a não informar seus dados cadastrais e/ou de acesso
                                    à plataforma a terceiros, responsabilizando-se integralmente pelo uso que deles seja
                                    feito.
                                    Menores de 18 anos e aqueles que não possuírem plena capacidade civil
                                    deverão obter previamente o consentimento expresso de seus responsáveis legais
                                    para utilização da plataforma e dos serviços ou produtos, sendo de responsabilidade
                                    exclusiva dos mesmos o eventual acesso por menores de idade e por aqueles que
                                    não possuem plena capacidade civil sem a prévia autorização.
                                    Mediante a realização do cadastro o usuário declara e garante expressamente
                                    ser plenamente capaz, podendo exercer e usufruir livremente dos serviços e produtos.
                                    O usuário deverá fornecer um endereço de e-mail válido, através do qual o site
                                    realizará todas as comunicações necessárias.
                                    Após a confirmação do cadastro, o usuário possuirá um login e uma senha
                                    pessoal, a qual assegura ao usuário o acesso individual à mesma. Desta forma,
                                    compete ao usuário exclusivamente a manutenção de referida senha de maneira
                                    confidencial e segura, evitando o acesso indevido às informações pessoais.
                                    Toda e qualquer atividade realizada com o uso da senha será de
                                    responsabilidade do usuário, que deverá informar prontamente a plataforma em caso
                                    de uso indevido da respectiva senha.
                                    Não será permitido ceder, vender, alugar ou transferir, de qualquer forma, a
                                    conta, que é pessoal e intransferível.
                                    Caberá ao usuário assegurar que o seu equipamento seja compatível com as
                                    características técnicas que viabilize a utilização da plataforma e dos serviços ou
                                    produtos.
                                    105
                                    O usuário poderá, a qualquer tempo, requerer o cancelamento de seu cadastro
                                    junto ao aplicativo Apetit. O seu descadastramento será realizado o mais rapidamente
                                    possível, desde que não sejam verificados débitos em aberto.
                                    O usuário, ao aceitar os Termos e Política de Privacidade, autoriza
                                    expressamente a plataforma a coletar, usar, armazenar, tratar, ceder ou utilizar as
                                    informações derivadas do uso dos serviços, do site e quaisquer plataformas, incluindo
                                    todas as informações preenchidas pelo usuário no momento em que realizar ou
                                    atualizar seu cadastro, além de outras expressamente descritas na Política de
                                    Privacidade que deverá ser autorizada pelo usuário. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>5) Dos serviços ou produtos</Text> {'\n'}
                                    A plataforma poderá disponibilizar para o usuário um conjunto específico de
                                    funcionalidades e ferramentas para otimizar o uso dos serviços e produtos.
                                    Na plataforma os serviços ou produtos oferecidos estão descritos e
                                    apresentados com o maior grau de exatidão, contendo informações sobre suas
                                    características, qualidades, quantidades, composição, preço, garantia, prazos de
                                    validade e origem, entre outros dados, bem como sobre os riscos que apresentam à
                                    saúde e segurança do usuário.
                                    Antes de finalizar a compra sobre determinado produto ou serviço, o usuário
                                    deverá se informar sobre as suas especificações e sobre a sua destinação.
                                    A entrega de serviços ou produtos adquiridos na plataforma será informada no
                                    momento da finalização da compra. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>6) Dos preços</Text> {'\n'}
                                    A plataforma se reserva no direito de reajustar unilateralmente, a qualquer
                                    tempo, os valores dos serviços ou produtos sem consulta ou anuência prévia do
                                    usuário.
                                    Os valores aplicados são aqueles que estão em vigor no momento do pedido.
                                    Os preços são indicados em reais e não incluem as taxas de entrega, as quais
                                    são especificadas à parte e são informadas ao usuário antes da finalização do pedido.
                                    Na contratação de determinado serviço ou produto, a plataforma poderá
                                    solicitar as informações financeiras do usuário, como CPF, endereço de cobrança e
                                    106
                                    dados de cartões. Ao inserir referidos dados o usuário concorda que sejam cobrados,
                                    de acordo com a forma de pagamento que venha a ser escolhida, os preços então
                                    vigentes e informados quando da contratação. Referidos dados financeiros poderão
                                    ser armazenados para facilitar acessos e contratações futuras. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>7) Da troca e devolução</Text> {'\n'}
                                    A política de troca e devoluções da plataforma é regida conforme o Código de
                                    Defesa do Consumidor (Lei nº 8.078/90).
                                    A troca e/ou devolução do produto poderá ocorrer por:
                                    a) direito de arrependimento;
                                    b) vício do produto.
                                    Em caso de arrependimento, o usuário poderá devolver o produto em até 7
                                    (sete) dias após o seu recebimento, mediante contato com a central de atendimento,
                                    de acordo com o Código de Defesa do Consumidor (Lei nº 8.078/90).
                                    Em caso de vício do produto, deverá ser verificado vícios de qualidade ou
                                    quantidade que tornem o produto impróprios ou inadequados ao consumo a que se
                                    destinam ou que lhes diminuam o valor. Ainda, poderão ser trocados ou devolvidos os
                                    produtos ou serviços que apresentam disparidade com as indicações constantes na
                                    plataforma no momento da compra ou na embalagem, respeitando as variações
                                    decorrentes de sua natureza.
                                    O usuário deverá entrar em contato com a central de atendimento tão logo
                                    constate o vício. Se, no prazo máximo de 30 (trinta) dias, não for possível resolver o
                                    vício ou, independentemente deste prazo, a substituição das partes viciadas puder
                                    comprometer a qualidade ou características do produto ou serviço, diminuir-lhe o valor
                                    ou se tratar de produto ou serviço essencial, o usuário poderá optar pela substituição
                                    do produto por outro da mesma espécie ou pela reexecução do serviço, pela
                                    devolução das quantias pagas ou pelo abatimento proporcional do preço. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>8) Do suporte</Text> {'\n'}
                                    Em caso de qualquer dúvida, sugestão ou problema com a utilização da
                                    plataforma, o usuário poderá entrar em contato com o suporte, através do e-mail
                                    centralAtendimento@apetit.com OU telefone xxxxxx .
                                    107
                                    Estes serviços de atendimento ao usuário estarão disponíveis nos seguintes
                                    dias e horários: seg à sáb das 8h às 22h. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>9) Das responsabilidades</Text> {'\n'}
                                    É de responsabilidade do usuário:
                                    a) defeitos ou vícios técnicos originados no próprio sistema do usuário;
                                    b) a correta utilização da plataforma, dos serviços ou produtos oferecidos,
                                    prezando pela boa convivência, pelo respeito e cordialidade entre os usuários;
                                    c) pelo cumprimento e respeito ao conjunto de regras disposto nesse Termo de
                                    Condições Geral de Uso, na respectiva Política de Privacidade e na legislação
                                    nacional e internacional;
                                    d) pela proteção aos dados de acesso à sua conta/perfil (login e senha).
                                    É de responsabilidade da plataforma Apetit:
                                    a) indicar as características do serviço ou produto;
                                    b) os defeitos e vícios encontrados no serviço ou produto oferecido desde que lhe
                                    tenha dado causa;
                                    c) as informações que foram por ele divulgadas, sendo que os comentários ou
                                    informações divulgadas por usuários são de inteira responsabilidade dos
                                    próprios usuários;
                                    d) os conteúdos ou atividades ilícitas praticadas através da sua plataforma.
                                    A plataforma não se responsabiliza por links externos contidos em seu sistema que
                                    possam redirecionar o usuário à ambiente externo a sua rede.
                                    Não poderão ser incluídos links externos ou páginas que sirvam para fins
                                    comerciais ou publicitários ou quaisquer informações ilícitas, violentas, polêmicas,
                                    pornográficas, xenofóbicas, discriminatórias ou ofensivas. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>10) Dos direitos autorais</Text> {'\n'}
                                    O presente Termo de Uso concede aos usuários uma licença não exclusiva,
                                    não transferível e não sublicenciável, para acessar e fazer uso da plataforma e dos
                                    serviços e produtos por ela disponibilizados.
                                    108
                                    A estrutura do site ou aplicativo, as marcas, logotipos, nomes comerciais,
                                    layouts, gráficos e design de interface, imagens, ilustrações, fotografias,
                                    apresentações, vídeos, conteúdos escritos e de som e áudio, programas de
                                    computador, banco de dados, arquivos de transmissão e quaisquer outras
                                    informações e direitos de propriedade intelectual da razão social Pata Amiga ldta,
                                    observados os termos da Lei da Propriedade Industrial (Lei nº 9.279/96), Lei de
                                    Direitos Autorais (Lei nº 9.610/98) e Lei do Software (Lei nº 9.609/98), estão
                                    devidamente reservados.
                                    Este Termos de Uso não cede ou transfere ao usuário qualquer direito, de modo
                                    que o acesso não gera qualquer direito de propriedade intelectual ao usuário, exceto
                                    pela licença limitada ora concedida.
                                    O uso da plataforma pelo usuário é pessoal, individual e intransferível, sendo
                                    vedado qualquer uso não autorizado, comercial ou não-comercial. Tais usos
                                    consistirão em violação dos direitos de propriedade intelectual da razão social Pata
                                    Amiga ltda, puníveis nos termos da legislação aplicável. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>11) Das sanções</Text> {'\n'}
                                    Sem prejuízo das demais medidas legais cabíveis, a razão social Pata Amiga
                                    ltda poderá, a qualquer momento, advertir, suspender ou cancelar a conta do usuário:
                                    a) que violar qualquer dispositivo do presente Termo;
                                    b) que descumprir os seus deveres de usuário;
                                    c) que tiver qualquer comportamento fraudulento, doloso ou que ofenda a
                                    terceiros. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>12) Da rescisão</Text> {'\n'}
                                    A não observância das obrigações pactuadas neste Termo de Uso ou da
                                    legislação aplicável poderá, sem prévio aviso, ensejar a imediata rescisão unilateral
                                    por parte da razão social Pata Amiga ltda e o bloqueio de todos os serviços prestados
                                    ao usuário. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>13) Das alterações</Text> {'\n'}
                                    Os itens descritos no presente instrumento poderão sofrer alterações,
                                    unilateralmente e a qualquer tempo, por parte de Pata Amiga ltda, para adequar ou
                                    109
                                    modificar os serviços, bem como para atender novas exigências legais. As alterações
                                    serão veiculadas pelo aplicativo Apetit e o usuário poderá optar por aceitar o novo
                                    conteúdo ou por cancelar o uso dos serviços, caso seja assinante de algum serviço. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>14) Da política de privacidade</Text> {'\n'}
                                    Além do presente Termo, o usuário deverá consentir com as disposições
                                    contidas na respectiva Política de Privacidade a ser apresentada a todos os
                                    interessados dentro da interface da plataforma. {'\n'}{'\n'}
                                    <Text style={[styles.termsText, {fontWeight: 'bold'}]}>15) Do foro</Text> {'\n'}
                                    Para a solução de controvérsias decorrentes do presente instrumento será
                                    aplicado integralmente o Direito brasileiro.
                                    Os eventuais litígios deverão ser apresentados no foro da comarca em que se
                                    encontra a sede da empresa.    
                                </Text>
                            </ScrollView>
                        </View>
                        <View style={{flex: 0.2, justifyContent: 'center', alignItems: 'center'}}>
                            <View style={[styles.termsView, {marginVertical: 15}]}>
                                {checkBox()}
                                <Text style={styles.termsText}>Li e estou de acordo com o Termo de Uso e Política de Privacidade</Text>
                            </View>

                            <TouchableOpacity style={styles.modalBtn} onPress={agreeWithTerms}>
                                <Text style={styles.modalBtnText}>Prosseguir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    content: { 
        justifyContent: 'center', 
        alignItems: 'center',
        width: Dimensions.get('screen').width,
        backgroundColor: '#28b2d6',
        borderTopStartRadius: 10,
        borderTopEndRadius: 10
    },

    logoApetit: {
        width: 100,
        height: 60,
        alignSelf: 'center',
        marginBottom: 25
    },

    image: {
        alignSelf: 'center',
        marginVertical: 30
    },

    openingTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 23,
        lineHeight: 35,
        textAlign: 'center',
        width: Dimensions.get('screen').width * 0.8
    },

    openingMessage: {
        fontFamily: 'Montserrat',
        fontSize: 15,
        textAlign: 'center',
        width: Dimensions.get('screen').width * 0.83,
        lineHeight: 23,
        color: 'black',
        marginTop: 20
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
    },

    modalBackground: {
        backgroundColor: 'black',
        opacity: 0.7,
        flex: 1,
    },

    modalContent: {
        backgroundColor: '#fff',
        width: Dimensions.get('screen').width * 0.85,
        height: Dimensions.get('screen').height * 0.85,
        position: 'absolute',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        padding: 15
    },

    modalTitle: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 25,
        flex: 0.1
    },

    checkBox: {
        width: 25,
        borderRadius: 7,
        borderColor: 'black',
        borderWidth: 2,
        height: 25,
        marginRight: 10
    },

    checkBoxColor: {
        backgroundColor: '#28b2d6',
        flex: 1,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },

    terms: {
        borderWidth: 2,
        borderRadius: 5,
        flex: 0.6,
        marginVertical: 10,
        padding: 10,
        borderColor: '#28b2d6'
    },

    termsView: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        flexDirection: 'row'
    },

    termsText: {
        fontFamily: 'Montserrat',
        fontSize: 14,
        textAlign: 'justify',
        lineHeight: 15
    },

    modalBtn: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 45,
        width: 180,
        borderRadius: 7,
        backgroundColor: '#ff9b4f'
    },

    modalBtnText: {
        fontFamily: 'Montserrat-SemiBold',
        fontSize: 17,
        color: 'white'
    }
})