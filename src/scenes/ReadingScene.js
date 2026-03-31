/**
 * ReadingScene — Reading comprehension game for ages 8-10.
 *
 * Shows a short text passage and asks multiple-choice questions
 * about it. Texts are shuffled to minimise repetition.
 *
 * Each passage has 3 questions; the game plays through 9 questions
 * total (3 passages × 3 questions).
 */
class ReadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ReadingScene' });
    }

    create() {
        this.W = this.scale.width;
        this.H = this.scale.height;

        this.score       = 0;
        this.streak      = 0;
        this.passageIdx  = 0;       // current passage (0-based)
        this.questionIdx = 0;       // question within the current passage
        this.totalPasses = 3;       // passages per game session

        // Shuffle the passage bank and take the first `totalPasses`
        this._passages = Phaser.Utils.Array.Shuffle(this._getPassageBank()).slice(0, this.totalPasses);
        this._totalQuestions = this._passages.reduce((s, p) => s + p.questions.length, 0);
        this._answeredQuestions = 0;

        this._drawBackground();
        this._drawHeader();
        this._showPassage();
        this.cameras.main.fadeIn(400);
    }

    // ─── Passage bank ────────────────────────────────────────────────────────

    _getPassageBank() {
        return [
            {
                title: '🐬 Los delfines',
                text:
                    'Los delfines son mamíferos marinos muy inteligentes. ' +
                    'Viven en grupos llamados manadas y se comunican entre sí ' +
                    'usando sonidos parecidos a silbidos y clics. ' +
                    'Aunque viven en el agua, necesitan salir a la superficie ' +
                    'para respirar aire, igual que nosotros. ' +
                    'Son conocidos por su carácter juguetón y por ayudarse ' +
                    'unos a otros cuando alguno está herido.',
                questions: [
                    {
                        q: '¿Cómo se llama el grupo en que viven los delfines?',
                        correct: 'Manada',
                        wrong: ['Bandada', 'Rebaño', 'Colonia']
                    },
                    {
                        q: '¿Por qué los delfines salen a la superficie?',
                        correct: 'Para respirar aire',
                        wrong: ['Para comer peces', 'Para jugar', 'Para dormir']
                    },
                    {
                        q: '¿Qué tipo de animales son los delfines?',
                        correct: 'Mamíferos marinos',
                        wrong: ['Peces', 'Reptiles', 'Aves']
                    }
                ]
            },
            {
                title: '🌋 Los volcanes',
                text:
                    'Un volcán es una abertura en la corteza terrestre por donde ' +
                    'sale magma, que es roca fundida a altísimas temperaturas. ' +
                    'Cuando el magma sale al exterior se llama lava. ' +
                    'Los volcanes pueden estar activos, dormidos o extintos. ' +
                    'Aunque parecen peligrosos, los suelos volcánicos son muy ' +
                    'fértiles y muchas personas cultivan cerca de ellos.',
                questions: [
                    {
                        q: '¿Cómo se llama la roca fundida dentro de la Tierra?',
                        correct: 'Magma',
                        wrong: ['Lava', 'Granito', 'Carbón']
                    },
                    {
                        q: '¿Cómo se llama el magma cuando sale al exterior?',
                        correct: 'Lava',
                        wrong: ['Magma', 'Ceniza', 'Vapor']
                    },
                    {
                        q: '¿Por qué cultivan personas cerca de los volcanes?',
                        correct: 'El suelo volcánico es muy fértil',
                        wrong: ['Hace mucho calor', 'Hay mucha agua', 'Es más barato']
                    }
                ]
            },
            {
                title: '🐜 Las hormigas',
                text:
                    'Las hormigas son insectos que viven en colonias enormes. ' +
                    'Cada hormiga tiene una función: la reina pone huevos, ' +
                    'las obreras buscan comida y construyen el hormiguero, ' +
                    'y los soldados defienden la colonia. ' +
                    'A pesar de su tamaño, las hormigas pueden cargar objetos ' +
                    'mucho más pesados que ellas. ' +
                    'Se comunican usando sustancias químicas llamadas feromonas.',
                questions: [
                    {
                        q: '¿Qué hace la reina de las hormigas?',
                        correct: 'Poner huevos',
                        wrong: ['Buscar comida', 'Defender la colonia', 'Construir el hormiguero']
                    },
                    {
                        q: '¿Cómo se comunican las hormigas?',
                        correct: 'Con feromonas',
                        wrong: ['Con sonidos', 'Con colores', 'Con señales de luz']
                    },
                    {
                        q: '¿Qué nombre recibe el grupo en que viven las hormigas?',
                        correct: 'Colonia',
                        wrong: ['Manada', 'Enjambre', 'Bandada']
                    }
                ]
            },
            {
                title: '☀️ El sistema solar',
                text:
                    'El sistema solar está formado por el Sol y todos los cuerpos ' +
                    'celestes que giran a su alrededor. Hay ocho planetas: ' +
                    'Mercurio, Venus, la Tierra, Marte, Júpiter, Saturno, ' +
                    'Urano y Neptuno. ' +
                    'La Tierra es el único planeta donde sabemos que existe vida. ' +
                    'Saturno es famoso por sus hermosos anillos formados por ' +
                    'hielo y polvo.',
                questions: [
                    {
                        q: '¿Cuántos planetas tiene el sistema solar?',
                        correct: 'Ocho',
                        wrong: ['Siete', 'Nueve', 'Diez']
                    },
                    {
                        q: '¿Qué planeta es famoso por sus anillos?',
                        correct: 'Saturno',
                        wrong: ['Júpiter', 'Urano', 'Marte']
                    },
                    {
                        q: '¿Cuál es el único planeta con vida conocida?',
                        correct: 'La Tierra',
                        wrong: ['Marte', 'Venus', 'Mercurio']
                    }
                ]
            },
            {
                title: '🌊 El agua en la Tierra',
                text:
                    'El agua cubre aproximadamente el 71 % de la superficie terrestre, ' +
                    'pero solo el 3 % es agua dulce apta para beber. ' +
                    'El agua sigue un ciclo: se evapora con el calor del sol, ' +
                    'forma nubes y regresa a la Tierra en forma de lluvia o nieve. ' +
                    'Sin agua, ningún ser vivo podría sobrevivir. ' +
                    'Por eso es muy importante ahorrar y no contaminarla.',
                questions: [
                    {
                        q: '¿Qué porcentaje de la superficie terrestre cubre el agua?',
                        correct: '71 %',
                        wrong: ['50 %', '30 %', '90 %']
                    },
                    {
                        q: '¿Qué forma tiene el agua cuando vuelve del cielo?',
                        correct: 'Lluvia o nieve',
                        wrong: ['Vapor', 'Hielo', 'Rocío']
                    },
                    {
                        q: '¿Por qué debemos ahorrar agua?',
                        correct: 'Porque es esencial para la vida',
                        wrong: ['Porque es muy cara', 'Porque pesa mucho', 'Porque es difícil de obtener']
                    }
                ]
            },
            {
                title: '📚 La biblioteca',
                text:
                    'Una biblioteca es un lugar donde se guardan y prestan libros. ' +
                    'Los libros están organizados por temas para encontrarlos fácilmente. ' +
                    'Existen bibliotecas públicas abiertas para todos y también ' +
                    'bibliotecas escolares dentro de los colegios. ' +
                    'Hoy en día también hay bibliotecas digitales donde los libros ' +
                    'se pueden leer en una tableta o un ordenador. ' +
                    'Leer libros ayuda a aprender nuevas palabras y a desarrollar la imaginación.',
                questions: [
                    {
                        q: '¿Para qué sirve una biblioteca?',
                        correct: 'Guardar y prestar libros',
                        wrong: ['Ver películas', 'Comprar libros', 'Escuchar música']
                    },
                    {
                        q: '¿Cómo están organizados los libros en la biblioteca?',
                        correct: 'Por temas',
                        wrong: ['Por colores', 'Por tamaño', 'Por precio']
                    },
                    {
                        q: '¿Qué beneficio tiene leer libros?',
                        correct: 'Aprender palabras y desarrollar la imaginación',
                        wrong: ['Mejorar la vista', 'Ganar dinero', 'Ponerse fuerte']
                    }
                ]
            },
            {
                title: '🦁 La sabana africana',
                text:
                    'La sabana africana es una gran llanura con hierba alta y pocos árboles. ' +
                    'Allí viven animales como leones, elefantes, jirafas y cebras. ' +
                    'Los leones cazan en grupo y son llamados el "rey de la selva". ' +
                    'Las jirafas tienen el cuello muy largo para alcanzar las hojas ' +
                    'de los árboles más altos. ' +
                    'En la sabana existe un equilibrio natural: los depredadores ' +
                    'controlan la población de otros animales.',
                questions: [
                    {
                        q: '¿Por qué tienen el cuello largo las jirafas?',
                        correct: 'Para alcanzar hojas de árboles altos',
                        wrong: ['Para correr más rápido', 'Para nadar mejor', 'Para oír a los leones']
                    },
                    {
                        q: '¿Cómo cazan los leones?',
                        correct: 'En grupo',
                        wrong: ['Solos', 'De noche solamente', 'Con trampas']
                    },
                    {
                        q: '¿Qué tipo de paisaje es la sabana?',
                        correct: 'Llanura con hierba alta y pocos árboles',
                        wrong: ['Bosque denso', 'Desierto de arena', 'Montaña nevada']
                    }
                ]
            },
            {
                title: '🤖 Los robots',
                text:
                    'Un robot es una máquina programada para realizar tareas de forma ' +
                    'automática. Los robots se usan en fábricas para construir coches, ' +
                    'en hospitales para ayudar en operaciones y en el espacio ' +
                    'para explorar otros planetas. ' +
                    'Para funcionar, los robots necesitan sensores que les permitan ' +
                    'percibir su entorno y un programa informático que indique ' +
                    'qué deben hacer.',
                questions: [
                    {
                        q: '¿Qué necesita un robot para percibir su entorno?',
                        correct: 'Sensores',
                        wrong: ['Ojos', 'Orejas', 'Antenas']
                    },
                    {
                        q: '¿Para qué se usan robots en hospitales?',
                        correct: 'Para ayudar en operaciones',
                        wrong: ['Para limpiar', 'Para cocinar', 'Para recibir pacientes']
                    },
                    {
                        q: '¿Qué es un robot?',
                        correct: 'Una máquina programada para realizar tareas',
                        wrong: ['Un animal mecánico', 'Un juguete eléctrico', 'Un ordenador portátil']
                    }
                ]
            },
            {
                title: '🌿 La fotosíntesis',
                text:
                    'Las plantas fabrican su propio alimento mediante la fotosíntesis. ' +
                    'Para ello necesitan luz solar, agua y dióxido de carbono. ' +
                    'Durante la fotosíntesis, las plantas producen glucosa, ' +
                    'que les sirve de energía, y liberan oxígeno al aire. ' +
                    'Gracias a las plantas, los animales y las personas disponemos ' +
                    'del oxígeno que necesitamos para respirar.',
                questions: [
                    {
                        q: '¿Qué producen las plantas durante la fotosíntesis?',
                        correct: 'Glucosa y oxígeno',
                        wrong: ['Agua y sal', 'Dióxido de carbono', 'Azúcar y nitrógeno']
                    },
                    {
                        q: '¿Qué tres cosas necesitan las plantas para hacer la fotosíntesis?',
                        correct: 'Luz, agua y dióxido de carbono',
                        wrong: ['Tierra, viento y lluvia', 'Sol, sal y abono', 'Aire, frío y minerales']
                    },
                    {
                        q: '¿Por qué son importantes las plantas para los animales?',
                        correct: 'Producen el oxígeno que respiramos',
                        wrong: ['Dan sombra', 'Producen agua', 'Generan calor']
                    }
                ]
            },
            {
                title: '⚽ Historia del fútbol',
                text:
                    'El fútbol moderno nació en Inglaterra en el siglo XIX. ' +
                    'En 1863 se crearon las primeras reglas oficiales. ' +
                    'Hoy es el deporte más popular del mundo, con millones de ' +
                    'aficionados en todos los continentes. ' +
                    'El objetivo del juego es meter el balón en la portería ' +
                    'del equipo contrario más veces que ellos. ' +
                    'Cada equipo tiene once jugadores, incluido el portero.',
                questions: [
                    {
                        q: '¿Dónde nació el fútbol moderno?',
                        correct: 'Inglaterra',
                        wrong: ['España', 'Brasil', 'Alemania']
                    },
                    {
                        q: '¿Cuántos jugadores tiene cada equipo?',
                        correct: 'Once',
                        wrong: ['Diez', 'Nueve', 'Doce']
                    },
                    {
                        q: '¿Cuándo se crearon las primeras reglas oficiales?',
                        correct: 'En 1863',
                        wrong: ['En 1900', 'En 1750', 'En 1950']
                    }
                ]
            },
            {
                title: '🍫 El chocolate',
                text:
                    'El chocolate se elabora a partir de las semillas del cacao, ' +
                    'un árbol originario de América. ' +
                    'Los mayas y los aztecas ya preparaban bebidas con cacao ' +
                    'hace más de 3 000 años. ' +
                    'Cuando los españoles llegaron a América, llevaron el cacao ' +
                    'a Europa, donde se le añadió azúcar y se hizo muy popular. ' +
                    'El chocolate negro tiene más cacao y es más amargo, ' +
                    'mientras que el chocolate con leche es más dulce.',
                questions: [
                    {
                        q: '¿De qué se elabora el chocolate?',
                        correct: 'Semillas de cacao',
                        wrong: ['Semillas de café', 'Leche en polvo', 'Vainilla']
                    },
                    {
                        q: '¿Quiénes usaban cacao antes que los europeos?',
                        correct: 'Los mayas y los aztecas',
                        wrong: ['Los romanos', 'Los chinos', 'Los egipcios']
                    },
                    {
                        q: '¿Qué añadieron los europeos al cacao?',
                        correct: 'Azúcar',
                        wrong: ['Sal', 'Miel', 'Limón']
                    }
                ]
            },
            {
                title: '🏔️ El Everest',
                text:
                    'El monte Everest, situado en los Himalayas entre Nepal y Tibet, ' +
                    'es la montaña más alta del mundo con 8 849 metros de altitud. ' +
                    'La primera ascensión oficial al Everest fue realizada en 1953 ' +
                    'por Edmund Hillary y Tenzing Norgay. ' +
                    'Escalar el Everest es muy peligroso: las temperaturas bajan ' +
                    'a -60 °C y el aire tiene poco oxígeno, por lo que los alpinistas ' +
                    'deben llevar botellas de oxígeno.',
                questions: [
                    {
                        q: '¿Cuánto mide el Everest?',
                        correct: '8 849 metros',
                        wrong: ['7 000 metros', '9 500 metros', '6 500 metros']
                    },
                    {
                        q: '¿En qué año se realizó la primera ascensión oficial?',
                        correct: '1953',
                        wrong: ['1903', '1920', '1970']
                    },
                    {
                        q: '¿Por qué los alpinistas llevan botellas de oxígeno?',
                        correct: 'Porque el aire tiene poco oxígeno',
                        wrong: ['Porque hace mucho frío', 'Porque es muy alto', 'Porque pesa mucho']
                    }
                ]
            }
        ];
    }

    // ─── Background & header ─────────────────────────────────────────────────

    _drawBackground() {
        const g = this.add.graphics();
        g.fillStyle(0x1a1a2e);
        g.fillRect(0, 0, this.W, this.H);
    }

    _drawHeader() {
        const W = this.W, H = this.H;
        const hdr = this.add.graphics();
        hdr.fillStyle(0x0f3460, 0.95);
        hdr.fillRect(0, 0, W, H * 0.13);

        this.add.text(W / 2, H * 0.065, '📖 Lectura', {
            fontSize: Math.floor(H * 0.048) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);

        this._makeSmallButton(55, H - 30, 90, 40, '← Salir', 0x555555, 0x333333, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    // ─── Passage display ─────────────────────────────────────────────────────

    _showPassage() {
        const W = this.W, H = this.H;
        if (this._mainGroup) this._mainGroup.destroy(true);
        this._mainGroup = this.add.group();

        const passage = this._passages[this.passageIdx];

        // progress indicator
        const overallRound = this._answeredQuestions + 1;
        this._mainGroup.add(this.add.text(W / 2, H * 0.17,
            'Pregunta ' + overallRound + ' / ' + this._totalQuestions, {
            fontSize: Math.floor(H * 0.028) + 'px',
            color: '#bdc3c7'
        }).setOrigin(0.5));

        // score
        this._mainGroup.add(this.add.text(W - 12, 8, '⭐ ' + this.score, {
            fontSize: Math.floor(H * 0.032) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            backgroundColor: '#0f3460',
            padding: { x: 8, y: 4 }
        }).setOrigin(1, 0));

        // streak
        if (this.streak >= 3) {
            this._mainGroup.add(this.add.text(12, 8, '🔥 ×' + this.streak, {
                fontSize: Math.floor(H * 0.032) + 'px',
                color: '#ff6b35',
                backgroundColor: '#2c0000',
                padding: { x: 8, y: 4 }
            }).setOrigin(0, 0));
        }

        // passage title
        this._mainGroup.add(this.add.text(W / 2, H * 0.22, passage.title, {
            fontSize: Math.floor(H * 0.038) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5));

        // text box
        const boxPad   = 16;
        const boxW     = W * 0.88;
        const boxH     = H * 0.33;
        const boxX     = (W - boxW) / 2;
        const boxY     = H * 0.27;

        const textBox = this.add.graphics();
        textBox.fillStyle(0x0d2137, 0.95);
        textBox.fillRoundedRect(boxX, boxY, boxW, boxH, 18);
        textBox.lineStyle(2, 0x2980b9, 0.8);
        textBox.strokeRoundedRect(boxX, boxY, boxW, boxH, 18);
        this._mainGroup.add(textBox);

        this._mainGroup.add(this.add.text(
            boxX + boxPad,
            boxY + boxPad,
            passage.text,
            {
                fontSize: Math.floor(H * 0.028) + 'px',
                fontFamily: 'Arial, sans-serif',
                color: '#ecf0f1',
                wordWrap: { width: boxW - boxPad * 2 },
                lineSpacing: 6
            }
        ).setOrigin(0, 0));

        // "Read and answer" prompt
        this._mainGroup.add(this.add.text(W / 2, boxY + boxH + H * 0.02,
            '¿Qué has aprendido? Responde:', {
            fontSize: Math.floor(H * 0.028) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#bdc3c7'
        }).setOrigin(0.5));

        // question
        const q = passage.questions[this.questionIdx];
        this._mainGroup.add(this.add.text(W / 2, H * 0.65, q.q, {
            fontSize: Math.floor(H * 0.034) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1',
            wordWrap: { width: W * 0.9 },
            align: 'center'
        }).setOrigin(0.5));

        this._correctAnswer = q.correct;

        // answer buttons (2 × 2 grid)
        const choices = Phaser.Utils.Array.Shuffle([q.correct, ...q.wrong]);
        const btnW  = Math.min(W * 0.42, 210);
        const btnH  = Math.floor(H * 0.085);
        const gapX  = 12;
        const gapY  = 10;
        const gridW = btnW * 2 + gapX;
        const sx    = (W - gridW) / 2;
        const sy    = H * 0.72;

        choices.forEach((choice, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const bx  = sx + col * (btnW + gapX) + btnW / 2;
            const by  = sy + row * (btnH + gapY) + btnH / 2;
            this._makeAnswerButton(bx, by, btnW, btnH, choice, choice === q.correct);
        });

        // entrance animation on text box
        this.tweens.add({
            targets: textBox,
            alpha: { from: 0, to: 1 },
            y:     { from: boxY + 20, to: boxY },
            duration: 400,
            ease: 'Quad.Out'
        });
    }

    // ─── Answer buttons ───────────────────────────────────────────────────────

    _makeAnswerButton(x, y, w, h, label, isCorrect) {
        const r  = Math.floor(h * 0.3);
        const bg = this.add.graphics();
        this._mainGroup.add(bg);

        const baseColor = 0x1a5276;
        const draw = (c) => {
            bg.clear();
            bg.fillStyle(0x000000, 0.2);
            bg.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 4, w, h, r);
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
            bg.lineStyle(2, 0xffffff, 0.4);
            bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(baseColor);

        const txt = this.add.text(x, y, label, {
            fontSize: Math.floor(h * 0.34) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 2,
            wordWrap: { width: w - 14 },
            align: 'center'
        }).setOrigin(0.5);
        this._mainGroup.add(txt);

        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        this._mainGroup.add(zone);

        zone.on('pointerover', () => draw(0x2980b9));
        zone.on('pointerout',  () => draw(baseColor));
        zone.on('pointerdown', () => {
            // Disable all buttons immediately
            this._mainGroup.getChildren().forEach(c => { if (c.input) c.input.enabled = false; });

            if (isCorrect) {
                draw(0x27ae60);
                this.score++;
                this.streak++;
                const bonus = this.add.text(x, y - 28, '✓ +1', {
                    fontSize: Math.floor(h * 0.44) + 'px',
                    color: '#2ecc71'
                }).setOrigin(0.5);
                this.tweens.add({ targets: bonus, y: y - 80, alpha: 0, duration: 800, onComplete: () => bonus.destroy() });
            } else {
                draw(0xe74c3c);
                this.streak = 0;
                const hint = this.add.text(this.W / 2, this.H * 0.97,
                    'Correcto: ' + this._correctAnswer, {
                    fontSize: Math.floor(h * 0.34) + 'px',
                    color: '#FFD700',
                    backgroundColor: '#0f3460',
                    padding: { x: 10, y: 5 }
                }).setOrigin(0.5, 1);
                this._mainGroup.add(hint);
            }

            this._answeredQuestions++;
            this.time.delayedCall(1000, () => this._advance());
        });
    }

    // ─── Advance logic ────────────────────────────────────────────────────────

    _advance() {
        const passage = this._passages[this.passageIdx];
        this.questionIdx++;

        if (this.questionIdx >= passage.questions.length) {
            // Move to next passage
            this.passageIdx++;
            this.questionIdx = 0;
        }

        if (this.passageIdx >= this._passages.length) {
            this._showEnd();
        } else {
            this._showPassage();
        }
    }

    // ─── End screen ───────────────────────────────────────────────────────────

    _showEnd() {
        if (this._mainGroup) this._mainGroup.destroy(true);

        const W = this.W, H = this.H;
        const pct = Math.round((this.score / this._totalQuestions) * 100);
        const emoji = pct >= 80 ? '🌟🌟🌟' : pct >= 50 ? '⭐⭐' : '⭐';

        this.add.text(W / 2, H * 0.28, '¡Juego terminado!', {
            fontSize: Math.floor(H * 0.055) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#FFD700',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.42, emoji, {
            fontSize: Math.floor(H * 0.08) + 'px'
        }).setOrigin(0.5);

        this.add.text(W / 2, H * 0.54,
            'Aciertos: ' + this.score + ' / ' + this._totalQuestions, {
            fontSize: Math.floor(H * 0.042) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#ecf0f1'
        }).setOrigin(0.5);

        const msg = pct >= 80
            ? '¡Eres un lector increíble! 🚀'
            : pct >= 50
            ? '¡Muy bien hecho! Sigue leyendo 📚'
            : '¡Practica más lectura! 💪';

        this.add.text(W / 2, H * 0.64, msg, {
            fontSize: Math.floor(H * 0.034) + 'px',
            color: '#2ecc71'
        }).setOrigin(0.5);

        this._makeSmallButton(W / 2, H * 0.77, 220, 52, 'Continuar ▶', 0x27ae60, 0x1e8449, () => {
            this.cameras.main.fade(300, 0, 0, 0);
            this.time.delayedCall(300, () => this.scene.start('HubScene'));
        });
    }

    // ─── Utility ─────────────────────────────────────────────────────────────

    _makeSmallButton(x, y, w, h, label, color, hoverColor, callback) {
        const bg = this.add.graphics();
        const r  = 12;
        const draw = (c) => {
            bg.clear();
            bg.fillStyle(c);
            bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, r);
        };
        draw(color);
        this.add.text(x, y, label, {
            fontSize: Math.floor(h * 0.46) + 'px',
            fontFamily: 'Arial Rounded MT Bold, Arial',
            color: '#fff'
        }).setOrigin(0.5);
        const zone = this.add.zone(x, y, w, h).setInteractive({ useHandCursor: true });
        zone.on('pointerover', () => draw(hoverColor));
        zone.on('pointerout',  () => draw(color));
        zone.on('pointerdown', callback);
    }
}
