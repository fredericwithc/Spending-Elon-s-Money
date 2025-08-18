// =====================================
// SISTEMA HÍBRIDO - LENDO PRODUTOS DO HTML
// =====================================

// Variáveis globais que mantêm o estado da aplicação
let dinheiro = 386000000000.00; // Fortuna do Elon Musk
let produtos = []; // Este array será preenchido automaticamente lendo o HTML
let historico = [];

// =====================================
// FUNÇÃO PRINCIPAL: CARREGAR PRODUTOS DO HTML
// =====================================

function carregarProdutosDoHTML() {
    console.log("Iniciando carregamento de produtos do HTML...");

    // Encontrar todos os wrappers de produtos na página
    const wrappers = document.querySelectorAll('.objeto-wrapper');
    console.log(`Encontrados ${wrappers.length} produtos no HTML`);

    // Para cada wrapper, extrair as informações e criar um objeto produto
    wrappers.forEach((wrapper, index) => {
        // Buscar os elementos que contêm as informações do produto
        const nomeElemento = wrapper.querySelector('.objeto-nome');
        const custoElemento = wrapper.querySelector('.objeto-custo');
        const inputQuantidade = wrapper.querySelector('.objeto-input');
        const botaoComprar = wrapper.querySelector('.botao-buy');
        const botaoVender = wrapper.querySelector('.botao-sell');

        // Extrair e limpar os dados
        const nome = nomeElemento.textContent.trim(); // trim() remove espaços extras

        // Para o preço, precisamos remover o símbolo $ e converter para número
        const precoTexto = custoElemento.textContent.trim();
        const preco = parseFloat(precoTexto.replace('$', ''));

        // Formatar o preço de volta no HTML para mostrar com vírgulas
        custoElemento.textContent = `$${preco.toLocaleString()}`;

        // Criar objeto que representa este produto
        const produto = {
            nome: nome,
            preco: preco,
            quantidade: 0, // Sempre começa com zero itens comprados
            inputJaFoiUsado: false, // rastrear se o input foi usado

            // Guardar referências dos elementos HTML para acesso rápido
            elementos: {
                wrapper: wrapper,
                input: inputQuantidade,
                botaoComprar: botaoComprar,
                botaoVender: botaoVender
            }
        };

        // Adicionar evento de clique nos botões
        // Usamos arrow functions para capturar o índice correto
        botaoComprar.addEventListener('click', () => comprarItem(index));
        botaoVender.addEventListener('click', () => venderItem(index));

        // Adicionar produto ao array global
        produtos.push(produto);

        console.log(`Produto carregado: ${nome} - $${preco}`);
    });

    console.log("Carregamento de produtos concluído!");
    console.log("Produtos disponíveis:", produtos);
}

// =====================================
// FUNÇÕES DE ANIMAÇÃO
// =====================================

function animarDinheiro(valorInicial, valorFinal) {
    const elementoDinheiro = document.getElementById('dinheiro');
    const duracao = 1000; // 1 segundo de animação
    const intervalo = 16; // 60 FPS (1000ms / 60 ≈ 16ms)
    const totalPassos = duracao / intervalo;
    const diferenca = valorFinal - valorInicial;
    const incrementoPorPasso = diferenca / totalPassos;

    let valorAtual = valorInicial;
    let passoAtual = 0;

    const animacao = setInterval(() => {
        passoAtual++;
        valorAtual += incrementoPorPasso;

        // Atualizar o display do dinheiro
        elementoDinheiro.textContent = formatarDinheiroCompleto(valorAtual);

        // Se chegou ao final da animação
        if (passoAtual >= totalPassos) {
            clearInterval(animacao);
            // Garantir que o valor final seja exato
            elementoDinheiro.textContent = formatarDinheiroCompleto(valorFinal);
            console.log(`🎬 Animação concluída: ${formatarDinheiroCompleto(valorFinal)}`);
        }
    }, intervalo);
}

// =====================================
// FUNÇÕES DE FORMATAÇÃO E UTILIDADES
// =====================================


function formatarDinheiroCompleto(valor) {
    // Para mostrar valores completos quando necessário
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(valor);
}

// =====================================
// FUNÇÕES DE ATUALIZAÇÃO DA INTERFACE
// =====================================

function atualizarInterface() {
    // Atualizar o display principal do dinheiro
    const elementoDinheiro = document.getElementById('dinheiro');
    elementoDinheiro.textContent = `${formatarDinheiroCompleto(dinheiro)}`;

    // Atualizar estatísticas globais
    atualizarInterfaceSemDinheiro();
}

function atualizarInterfaceSemDinheiro() {
    // Atualizar apenas os produtos, sem mexer no dinheiro
    produtos.forEach((produto) => {

        // Atualizar o input para mostrar a quantidade total atual
        produto.elementos.input.value = produto.quantidade

        // Lógica para o botão de comprar
        if (dinheiro >= produto.preco) {
            produto.elementos.botaoComprar.disabled = false;
            produto.elementos.botaoComprar.textContent = traduzir('botaoComprar');
            produto.elementos.botaoComprar.style.backgroundColor = "";
        } else {
            produto.elementos.botaoComprar.disabled = true;
            produto.elementos.botaoComprar.textContent = traduzir('semDinheiro');
            produto.elementos.botaoComprar.style.backgroundColor = "#6c757d";
        }

        // Lógica para o botão de vender
        if (produto.quantidade > 0) {
            produto.elementos.botaoVender.disabled = false;
            produto.elementos.botaoVender.textContent = traduzir('botaoVender');
            produto.elementos.botaoVender.style.backgroundColor = "";
        } else {
            produto.elementos.botaoVender.disabled = true;
            produto.elementos.botaoVender.textContent = traduzir('nadaParaVender');
            produto.elementos.botaoVender.style.backgroundColor = "#6c757d";
        }
    });

    // Atualizar estatísticas globais
    atualizarEstatisticas();
}

function atualizarEstatisticas() {
    // Calcular valor total gasto
    let valorTotalGasto = 0;
    let itensComprados = 0;

    produtos.forEach(produto => {
        valorTotalGasto += produto.quantidade * produto.preco;
        itensComprados += produto.quantidade;
    });

    // Mostrar estatísticas na mensagem principal
    const elementoMensagem = document.getElementById('mensagem');
    const dinheiroGasto = formatarDinheiroCompleto(valorTotalGasto);
    const dinheiroRestante = formatarDinheiroCompleto(dinheiro);

    elementoMensagem.innerHTML = `
    <span> ${traduzir('restam')}: ${dinheiroRestante} | 
    ${traduzir('gastou')}: ${dinheiroGasto} | 
    ${traduzir('itens')}: ${itensComprados}</span>
`;
}

// =====================================
// FUNÇÕES DE COMPRA E VENDA
// =====================================

function comprarItem(indiceProduto) {
    // PASSO 1: Pegar referência do produto usando o índice
    const produto = produtos[indiceProduto];

    // PASSO 2: Ler a quantidade desejada do input
    let quantidadeDesejada;

    if (produto.inputJaFoiUsado === false) {

        // Se o input ainda não foi usado, ler o valor dele
        const valorDoInput = lerQuantidadeDoInput(produto);

        // Se o input tem 0 ou é inválido, comprar 1 item
        if (valorDoInput <= 0 || isNaN(valorDoInput)) {
            quantidadeDesejada = 1;
            console.log(`Input tem 0 ou é inválido, comprando 1 item`);
        } else {
            quantidadeDesejada = valorDoInput;
            console.log(`Usando valor do input: ${quantidadeDesejada}`);
        }

    } else {
        // Se o input já foi usado, comprar apenas 1 item
        quantidadeDesejada = 1;
        console.log(`Input já foi usado, comprando apenas 1 item`);
    }

    console.log(`Tentando comprar: ${produto.nome} por $${produto.preco}`);

    // PASSO 3: Validar se a quantidade é válida
    if (!validarQuantidade(quantidadeDesejada, produto.nome)) {
        return; // Para a execução se a quantidade for inválida
    }

    // PASSO 4: Calcular custo total da compra
    const custoTotal = produto.preco * quantidadeDesejada;
    console.log(`Custo total: ${custoTotal}`);


    // passo 5: Verificar se há dinheiro suficiente
    if (dinheiro >= custoTotal) {
        // Guardar valor inicial para animação
        const dinheiroAntes = dinheiro;

        // Processar a compra
        dinheiro -= custoTotal;
        produto.quantidade += quantidadeDesejada;

        console.log(`Compra realizada! Nova quantidade: ${produto.quantidade}`);

        // PASSO 6: Marcar input como usado
        produto.inputJaFoiUsado = true;
        console.log(`Input marcado como usado para ${produto.nome}`);

        // Animar o dinheiro diminuindo
        animarDinheiro(dinheiroAntes, dinheiro);

        // Feedback visual com animação
        aplicarAnimacaoCompra();

        // Atualizar interface SEM o dinheiro (que já está sendo animado)
        atualizarInterfaceSemDinheiro();

        // Registrar no histórico
        adicionarHistorico('compra', produto, quantidadeDesejada, custoTotal);

        // Mostrar mensagem de sucesso com detalhes
        const mensagemSucesso = quantidadeDesejada === 1
            ? `${produto.nome} ${traduzir('comprado')}`
            : `${quantidadeDesejada}x ${produto.nome} ${traduzir('comprados')} $${custoTotal.toLocaleString()}!`;
        mostrarMensagemTemporaria(mensagemSucesso, 'sucesso');

    } else {
        // Calcular quanto falta de dinheiro
        const faltam = custoTotal - dinheiro;
        console.log(`Dinheiro insuficiente. Faltam ${faltam}`);

        // Mostrar mensagem informativa sobre quanto falta
        mostrarMensagemTemporaria(
            `${traduzir('precisaDe')} $${custoTotal.toLocaleString()} ${traduzir('masSoTem')} $${dinheiro.toLocaleString()}. ${traduzir('faltam')} $${faltam.toLocaleString()}!`,
            'erro'
        );
    }
}

function lerQuantidadeDoInput(produto) {
    // lê e converte o input em número
    const valorDigitado = produto.elementos.input.value;
    const quantidade = parseInt(valorDigitado);
    return quantidade;
}

function validarQuantidade(quantidade, nomeProduto) {
    // verifica se o número é válido
    if (isNaN(quantidade)) { /* mostra erro */ return false; }
    if (quantidade <= 0) { /* mostra erro */ return false; }
    if (quantidade > 1000000) { /* mostra erro */ return false; }
    return true;
}

function limparInput(produto) {
    // zera o input após compra
    produto.elementos.input.value = '';
}

function venderItem(indiceProduto) {
    const produto = produtos[indiceProduto];

    console.log(`Tentando vender: ${produto.nome}`);

    // Verificar se há itens para vender
    if (produto.quantidade > 0) {
        // Calcular preço de venda (80% do preço original)
        const precoVenda = produto.preco;

        // Processar a venda
        dinheiro += precoVenda;
        produto.quantidade--;

        console.log(`Venda realizada! Nova quantidade: ${produto.quantidade}`);

        // Atualizar interface
        atualizarInterface();

        // Registrar no histórico
        adicionarHistorico('venda', produto, 1, precoVenda);

        // Mostrar mensagem
        mostrarMensagemTemporaria(`${produto.nome} ${traduzir('vendido')} $${precoVenda}!`, 'sucesso');

    } else {
        console.log(`Nenhum ${produto.nome} para vender`);
        mostrarMensagemTemporaria(`${traduzir('naoTemParaVender')} ${produto.nome} ${traduzir('paraVender')}`, 'erro');
    }
}

// =====================================
// SISTEMA DE IDIOMAS
// =====================================

const idiomas = {
    'pt-br': {
        titulo: 'E se você tivesse o dinheiro do Elon Musk?',
        mensagemInicial: 'Vá a loucura e faça suas compras!',
        boasVindas: 'Bem-vindo ao simulador da fortuna do Elon Musk! Gaste $386,000,000,000 como quiser!',
        botaoComprar: 'Comprar',
        botaoVender: 'Vender',
        botaoReset: 'Reset',
        semDinheiro: 'Sem dinheiro',
        nadaParaVender: 'Vender',
        historicoTitulo: 'Histórico de Compras',
        restam: 'Restam',
        gastou: 'Gastou',
        itens: 'Itens',
        comprou1: 'Comprou 1',
        comprou: 'Comprou',
        por: 'por',
        total: 'total',
        vendeu1: 'Vendeu 1',
        comprado: 'comprado!',
        comprados: 'comprados por',
        vendido: 'vendido por',
        precisaDe: 'Você precisa de',
        masSoTem: 'mas só tem',
        faltam: 'Faltam',
        naoTemParaVender: 'Você não tem',
        paraVender: 'para vender!',
        fortunaRestaurada: 'Fortuna do Elon restaurada! Gaste $386,000,000,000 novamente!',
        produtos: {
            'Lata de Coca-Cola': 'Lata de Coca-Cola',
            'Baralho UNO': 'Baralho UNO',
            'Livro': 'Livro',
            'Alexa Echo Dot': 'Alexa Echo Dot',
            'Airfryer': 'Airfryer',
            'Kit de ferramentas completo': 'Kit de ferramentas completo',
            'Apple AirPods': 'Apple AirPods',
            'Nike Air Jordan 1 Retro High OG': 'Nike Air Jordan 1 Retro High OG',
            'PlayStation 5 com 2 controles': 'PlayStation 5 com 2 controles',
            'Apple iPhone 15 Pro (128GB)': 'Apple iPhone 15 Pro (128GB)',
            'TV Samsung Neo QLED 75"': 'TV Samsung Neo QLED 75"',
            'Guitarra Gibson ES-175': 'Guitarra Gibson ES-175',
            'Motocicleta BMW S 1000 RR': 'Motocicleta BMW S 1000 RR',
            'Rolex': 'Rolex',
            'Lancha': 'Lancha',
            'Camarote Final UEFA Champions League': 'Camarote Final UEFA Champions League',
            'Castelo na França': 'Castelo na França',
            'Ferrari 812 GTS 2025': 'Ferrari 812 GTS 2025',
            'Batmóvel "Tumbler"': 'Batmóvel "Tumbler"',
            'Superiate Pershing 140': 'Superiate Pershing 140',
            'Strum Island - Canadá': 'Strum Island - Canadá',
            'Tanque de Guerra': 'Tanque de Guerra',
            'Jatinho Grande': 'Jatinho Grande',
            'Noite Estrelada - Van Gogh': 'Noite Estrelada - Van Gogh',
            'Navio de Cruzeiro': 'Navio de Cruzeiro',
            'B2-Spirit': 'B2-Spirit',
            'Clube de Futebol Real Madrid': 'Clube de Futebol Real Madrid',
            'Clube de Futebol Americano New England Patriots': 'Clube de Futebol Americano New England Patriots',
            'Clube de Basquete Golden State Warriors': 'Clube de Basquete Golden State Warriors',
            'Twitter': 'Twitter'
        }
    },
    'en': {
        titulo: 'What if you had Elon Musk\'s money?',
        mensagemInicial: 'Go crazy and shop!',
        boasVindas: 'Welcome to Elon Musk\'s fortune simulator! Spend $386B however you want!',
        botaoComprar: 'Buy',
        botaoVender: 'Sell',
        botaoReset: 'Reset',
        semDinheiro: 'No money',
        nadaParaVender: 'Sell',
        historicoTitulo: 'Purchase History',
        restam: 'Remaining',
        gastou: 'Spent',
        itens: 'Items',
        comprou1: 'Bought 1',
        comprou: 'Bought',
        por: 'for',
        total: 'total',
        vendeu1: 'Sold 1',
        comprado: 'bought!',
        comprados: 'bought for',
        vendido: 'sold for',
        precisaDe: 'You need',
        masSoTem: 'but only have',
        faltam: 'Missing',
        naoTemParaVender: 'You don\'t have',
        paraVender: 'to sell!',
        fortunaRestaurada: 'Elon\'s fortune restored! Spend $386B again!',
        produtos: {
            'Lata de Coca-Cola': 'Coca-Cola Can',
            'Baralho UNO': 'UNO Card Deck',
            'Livro': 'Book',
            'Alexa Echo Dot': 'Alexa Echo Dot',
            'Airfryer': 'Air Fryer',
            'Kit de ferramentas completo': 'Complete Tool Kit',
            'Apple AirPods': 'Apple AirPods',
            'Nike Air Jordan 1 Retro High OG': 'Nike Air Jordan 1 Retro High OG',
            'PlayStation 5 com 2 controles': 'PlayStation 5 with 2 Controllers',
            'Apple iPhone 15 Pro (128GB)': 'Apple iPhone 15 Pro (128GB)',
            'TV Samsung Neo QLED 75"': 'Samsung Neo QLED 75" TV',
            'Guitarra Gibson ES-175': 'Gibson ES-175 Guitar',
            'Motocicleta BMW S 1000 RR': 'BMW S 1000 RR Motorcycle',
            'Rolex': 'Rolex Watch',
            'Lancha': 'Speed Boat',
            'Camarote Final UEFA Champions League': 'UEFA Champions League Final VIP Box',
            'Castelo na França': 'Castle in France',
            'Ferrari 812 GTS 2025': 'Ferrari 812 GTS 2025',
            'Batmóvel "Tumbler"': 'Batmobile "Tumbler"',
            'Superiate Pershing 140': 'Pershing 140 Superyacht',
            'Strum Island - Canadá': 'Strum Island - Canada',
            'Tanque de Guerra': 'Military Tank',
            'Jatinho Grande': 'Large Private Jet',
            'Noite Estrelada - Van Gogh': 'Starry Night - Van Gogh',
            'Navio de Cruzeiro': 'Cruise Ship',
            'B2-Spirit': 'B2-Spirit Bomber',
            'Clube de Futebol Real Madrid': 'Real Madrid Football Club',
            'Clube de Futebol Americano New England Patriots': 'New England Patriots NFL Team',
            'Clube de Basquete Golden State Warriors': 'Golden State Warriors NBA Team',
            'Twitter': 'Twitter'
        }
    }
};

let idiomaAtual = 'pt-br'; // Idioma padrão

function traduzir(chave) {
    return idiomas[idiomaAtual][chave] || chave;
}

function traduzirProduto(nomeOriginal) {
    // Se existe tradução para este produto, usar ela. Senão, manter o nome original
    return idiomas[idiomaAtual].produtos[nomeOriginal] || nomeOriginal;
}

function atualizarNomesProdutos() {
    // Atualizar o nome de cada produto na interface
    produtos.forEach((produto) => {
        const nomeElemento = produto.elementos.wrapper.querySelector('.objeto-nome');
        const nomeOriginal = produto.nome; // Nome original em português
        const nomeTranslated = traduzirProduto(nomeOriginal);

        nomeElemento.textContent = nomeTranslated;
    });
}

function trocarIdioma(novoIdioma) {
    idiomaAtual = novoIdioma;

    // Atualizar visual dos botões
    document.querySelectorAll('.botao-idioma').forEach(btn => btn.classList.remove('active'));
    const btnId = novoIdioma === 'pt-br' ? 'btn-pt-br' : 'btn-en';
    document.getElementById(btnId).classList.add('active');

    atualizarTextos();
    localStorage.setItem('idioma', novoIdioma); // Salvar preferência
}

function atualizarTextos() {
    // Atualizar título
    document.querySelector('h1').textContent = traduzir('titulo');

    // Atualizar histórico
    const tituloHistorico = document.querySelector('#historico h3');
    if (tituloHistorico) {
        tituloHistorico.textContent = traduzir('historicoTitulo');
    }

    // Atualizar botão reset
    document.querySelector('.botao-reset').textContent = traduzir('botaoReset');

    // Atualizar nomes dos produtos
    atualizarNomesProdutos();

    // Atualizar histórico com tradução
    atualizarExibicaoHistorico();

    // Atualizar interface
    atualizarInterface();
}

// =====================================
// FUNÇÕES DE FEEDBACK VISUAL
// =====================================

function aplicarAnimacaoCompra() {
    // Aplicar animação visual no elemento de status
    const status = document.getElementById('status');
    status.classList.add('animacao-compra');

    // Remover a animação após 300ms
    setTimeout(() => {
        status.classList.remove('animacao-compra');
    }, 300);
}

function mostrarMensagemTemporaria(texto, tipo) {
    const elementoMensagem = document.getElementById('mensagem');
    const conteudoOriginal = elementoMensagem.innerHTML;

    // Mostrar a mensagem temporária
    elementoMensagem.className = `mensagem ${tipo}`;
    elementoMensagem.innerHTML = `<span>${texto}</span>`;

    // Voltar ao conteúdo original após 3 segundos
    setTimeout(() => {
        atualizarEstatisticas(); // Isso restaura as estatísticas originais
    }, 3000);
}

// =====================================
// SISTEMA DE HISTÓRICO
// =====================================

function adicionarHistorico(tipoAcao, produto, quantidade, valor) {
    const agora = new Date().toLocaleTimeString();

    // Salvar dados estruturados para poder traduzir depois
    const entrada = {
        horario: agora,
        tipo: tipoAcao, // 'compra' ou 'venda'
        produto: produto.nome, // Nome original do produto
        quantidade: quantidade,
        valor: valor
    };

    historico.push(entrada);
    console.log(`Histórico adicionado:`, entrada);

    atualizarExibicaoHistorico();
}

function atualizarExibicaoHistorico() {
    const elementoHistorico = document.getElementById('historico');
    const listaHistorico = document.getElementById('listaHistorico');

    if (historico.length > 0) {
        elementoHistorico.style.display = 'block';

        const historicoRecente = historico
            .slice(-10)
            .reverse();

        listaHistorico.innerHTML = historicoRecente
            .map(item => {
                const produtoTraduzido = traduzirProduto(item.produto);

                if (item.tipo === 'compra') {
                    if (item.quantidade === 1) {
                        return `<div class="historico-item">${item.horario} - ${traduzir('comprou1')} ${produtoTraduzido} ${traduzir('por')} $${item.valor.toLocaleString()}</div>`;
                    } else {
                        return `<div class="historico-item">${item.horario} - ${traduzir('comprou')} ${item.quantidade}x ${produtoTraduzido} ${traduzir('por')} $${item.valor.toLocaleString()} ${traduzir('total')}</div>`;
                    }
                } else { // venda
                    return `<div class="historico-item">${item.horario} - ${traduzir('vendeu1')} ${produtoTraduzido} ${traduzir('por')} $${item.valor.toLocaleString()}</div>`;
                }
            })
            .join('');
    }
}

// =====================================
// FUNÇÃO DE RESET
// =====================================

function resetarJogo() {
    console.log("Reiniciando o jogo...");

    // Restaurar dinheiro original
    dinheiro = 386000000000.00;

    // Zerar quantidades de todos os produtos
    produtos.forEach(produto => {
        produto.quantidade = 0;
    });

    // Limpar histórico
    historico = [];

    // Esconder histórico
    const elementoHistorico = document.getElementById('historico');
    elementoHistorico.style.display = 'none';

    // Atualizar toda a interface
    atualizarInterface();

    // Mostrar mensagem de reset
    mostrarMensagemTemporaria(traduzir('fortunaRestaurada'), 'info');

    console.log("Jogo reiniciado com sucesso!");
}

// =====================================
// INICIALIZAÇÃO DO SISTEMA
// =====================================

// Esta função roda quando todo o HTML termina de carregar
document.addEventListener('DOMContentLoaded', function () {
    console.log("Inicializando sistema...");

    // Primeiro: carregar todos os produtos do HTML
    carregarProdutosDoHTML();

    // Segundo: atualizar a interface inicial
    atualizarInterface();

    // Terceiro: detectar idioma salvo e aplicar
    const idiomaSalvo = localStorage.getItem('idioma');
    if (idiomaSalvo && idiomas[idiomaSalvo]) {
        idiomaAtual = idiomaSalvo;
        // Atualizar botões de idioma
        document.querySelectorAll('.botao-idioma').forEach(btn => btn.classList.remove('active'));
        const btnId = idiomaSalvo === 'pt-br' ? 'btn-pt-br' : 'btn-en';
        document.getElementById(btnId).classList.add('active');
    }

    // Quarto: aplicar traduções e mostrar mensagem de boas-vindas
    atualizarTextos();
    const elementoMensagem = document.getElementById('mensagem');
    elementoMensagem.innerHTML = `<span>${traduzir('boasVindas')}</span>`;

    console.log("Sistema inicializado com sucesso!");
    console.log("Estado inicial:", { dinheiro, quantidadeProdutos: produtos.length });


});

