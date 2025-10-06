**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **FACTO: SERVICIO API SOAP **

**EMISIÓN DE DOCUMENTOS **

**Revisión 34 – 07/08/2023 **

****



****

**Elaborado por: **

**Revisado por: **

****

**Página 1 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Explicación de cambios realizados a este documento** **Revisión 34 **

- Cambio interno del documento 

**Revisión 33 **

- En nuestra documentación se incluía erróneamente referencias al archivo simulacion.php el cual no está actualizado y no corresponde como método de hacer pruebas. La forma correcta de realizar pruebas es a través de las claves de la demo en línea que ofrecemos. 

**Revisión 32 **

- SOLO para casos exportación: Se agrega campos opcional Indicador de servicios, y obligatorios: modalidad de venta y cláusula de venta. 

**Revisión 31 **

- Se agregan campos opcionales de sitio web y email que reemplazan los que estén configurados en la cuenta Facto en envio de email hacia el receptor. 

**Revisión 30 **

- Se agregan campos opcionales de moneda y tipo de cambio para casos de factura de exportación. 

**Revisión 29 **

- Se agrega nueva opción de tipo de redondeo: neto o bruto **Revisión 28 **

- Se agrega campo extra a observaciones que determina si la observación se agrega al XML o al PDF. 

- Se actualiza ejemplo de guía de despacho, se agrega tag de cierre </detalles>. ** **

**Revisión 27 **

- Se modificó el tipo de datos impuestoadicional\_valor de int a decimal **Revisión 26 **

- Se agregó campo vendedor\_id** **

- Se agregó campo observaciones** **

- Se agregó campo despacho\_direccion 

- Se agregó campo peso\_bruto 

**Elaborado por: **

**Revisado por: **

****

**Página 2 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Revisión 25 **

- Se agregó ejemplo de boleta electrónica en modo valores\_brutos. ** **

**Revisión 24 **

- Se agregó el campo de unidad\_medida a los datos de servicios periódicos. 

**Revisión 23 **

- Se cambió servicios periódicos por servicio periódico** **

- Dentro de servicio periódico se cambio consumo por consumo\_final y se agregó consumo\_subtotal como la diferencia de lecturas previo a la constante** **

- Dentro de servicio periódico, se dejó lectura anterior, lectura actual, constante y consumo como valores decimales en vez de enteros. ** **

**Revisión 22 **

- Se agregó nueva sección servicios periódicos al ingreso. ** **

- Se agregó campo receptor\_nombreinterno que permite asociar al cliente al nombre o código interno utilizado para identificarlo. ** **

**Revisión 21 **

- Se agregó nuevo tipo de referencia código 7: Referencia global a tipo de documento. ** **

**Revisión 20 **

- Se agregó opción de indicar SKU en los detalles del documento para efectos de descontar stock. ** **

**Revisión 19 **

- Se agregó opción de ingreso de valores brutos para caso de boletas electrónicas, no se pueden ingresar impuestos específicos al utilizar esta opción. ** **

**Revisión 18 **

- Se agregó el IVA Retenido Chatarra \(código 38\). Además se agregó ejemplo de cómo enviar los IVA retenidos** **

**Revisión 17 **

- Se agregó la opción de emitir boletas y boletas exentas electrónicas de manera nominativa \(con datos de receptor igual que una factura\) 

**Revisión 16 **

**Elaborado por: **

**Revisado por: **

****

**Página 3 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido **





- Se agregó la opción de ingreso manual del folio del documento **Revisión 15 **

- Se agregó información para el uso del complemento múltiples sucursales **Revisión 14 **

- Se cambió el tipo de datos de docreferencia\_folio de int a string **Revisión 13 **

- Se agregó la nueva funcionalidad de Simulación de emisión **Revisión 12 **

- Se agregó información respecto a escapar caracteres especiales **Introducción **

Este webservice define la forma de emitir documentos en Facto desde cualquier sistema, está construido en formato SOAP, con un WSDL que lo define. Para poder utilizarlo es necesario contar con una cuenta en Facto a la cual integrarse y una llave de acceso, el cual se compone por un usuario y clave diferente de los usuarios con los que ingresamos a Facto a través de la web. 

**Requerimientos para poder emitir un documento **

Para realizar una emisión es necesario contar con los siguientes elementos: 1\) Una instalación de Facto habilitada en el ambiente correspondiente \(desarrollo o producción\) 2\) Un usuario de Facto para la instalación. 

3\) Un usuario y clave de acceso API \(que irá relacionada al usuario. Todas las acciones que se haga mediante webservice quedarán registradas como realizadas por el usuario relacionado. El usuario API NO ES el usuario que ingresar al portal www.facto.cl\) 4\) Un certificado digital cargado en Facto 

5\) Habilitar permisos para que el usuario Facto pueda utilizar el certificado digital 6\) Cargar folios para emitir los documentos 

7\) Tener ingresada una fecha y número de resolución en Facto >> Administración >> Datos de la empresa \(En caso de que estemos trabajando con el ambiente de certificación, la fecha es la fecha de postulación al SII, y el número de resolución es 0 \) **Elaborado por: **

**Revisado por: **

****

**Página 4 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Funcionamiento general **

Llamada a 

webservice

¿Datos 

SI

enviados 

correctos? 

No

Generar 

documento en 

estado borrador 

en Facto

Status = 1 se 

retorna 

<mensaje\_error>. 

No se genera 

documento

¿Tenemos folios y 

certificado para enviar? 

SI

NO

Status = 2 se 

retorna 

Status = 0, todo 

<mensaje\_error>, 

OK, el documento 

el documento 

fue enviado al SII. 

queda generado 

Cuando sea 

como borrador 

revisado el SII 

pero no es 

enviará un email 

enviado al SII, se 

de confirmación a 

requiere acción 

la casil a de la 

manual de usuario 

empresa

en Facto

Respuesta





**Seguridad del webservice **

**Seguridad de la capa de Transporte **

**Elaborado por: **

**Revisado por: **

****

**Página 5 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Todas las solicitudes y respuestas serán encriptadas usando una conexión SSL mediante URL https:// al realizar la solicitud. 

**Autentificación mediante SOAP HEADERS **

Adicionalmente, es necesario autentificarse mediante headers usando parámetros user y pass. 



**Ambientes para emitir documentos **

**URL de conexión: **

El WSDL está disponible en la siguiente URL. A través de esta misma URL deben enviarse los documentos. 

Emitir documento 

https://conexion.facto.cl/documento.php?wsdl 

****

**Usuario y clave de pruebas: **

Para efectos de realizar pruebas, estas pueden realizarse conectándose directamente a la Demo disponible en www.facto.cl mediante los siguientes datos Usuario 

1.111.111-4/pruebasapi 

Clave 

90809d7721fe3cdcf1668ccf33fea982 





**Usuario y clave de producción: **

Una vez validado el correcto funcionamiento, se debe usar las claves de conexión propias del Facto de la empresa. Estas se obtienen en la opción Administración >> Servicios API dentro del Facto de la empresa. 



**Caracteres especiales **

Los XML generados deben procesar las entidades html de manera de evitar la malformación del XML 

enviado, así entonces: 

Caracter 

Debe enviarse como 

& 

&amp; 

**Elaborado por: **

**Revisado por: **

****

**Página 6 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido **





< 

&lt; 

> 

&gt; 



También es posible utilizar <\!\[CDATA\[ en el contenido para evitar tener que escapar el contenido interior. Facto recibirá los caracteres escapados de estas formas como si hubiesen sido originalmente enviados con el carácter deseado. 

**Complemento múltiple sucursales **

En caso de empresas que tengan activado el complemento para el uso de múltiples sucursales en Facto \(**este complemento no es parte de la** **funcionalidad estándar de Facto, debes contactar con el área comercial** **para ver costos y condiciones comerciales**\), se requiere que cada una de ellas esté registrada con su código dentro de Facto tanto el que provee el SII como identificación única para efectos tributarios, como también por un código interno, que servirá para identificar cuando se genera un documento por API \(pudiendo ser el mismo u otro diferente\). 



Por defecto, todo documento que sea enviado por API y que no lleve un código de sucursal se facturará desde Casa Matriz. 

**Elaborado por: **

**Revisado por: **

****

**Página 7 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Los documentos generados desde sucursal tendrán en la parte superior la dirección de la casa** **matriz y también de la sucursal correspondiente. De igual forma el XML que se envía al SII** **también tiene esta información. **





**Solicitud de emisión de documento \(REQUEST\) **



**Elaborado por: **

**Revisado por: **

****

**Página 8 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Diagrama **





**Campos y significado **

Opciones 

Este tag es OPCIONAL y se utiliza para configuraciones especiales del documento. No es necesario que sea enviado. 

Nombre 

Tipo 

Requerido/Opcional 

Descripción 

Id\_plantilla 

Int 

**Opcional **

Corresponde al ID de la plantilla de 

impresión para el documento. Si no se 

envía se usará la plantilla por defecto. Si se 

envía y la plantilla no es encontrada, se 

utilizará la plantilla por defecto, pero no 

habrá un mensaje especial de salida 

**Elaborado por: **

**Revisado por: **

****

**Página 9 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** informando que la plantilla no existe. Por 

este motivo es fundamental asegurar que 

el ID enviado sea correcto. 

valores\_brutos 

“1” 

**opcional **

Este campo sólo es válido para boletas 

electrónicas \(tipo\_dte = 39\) y permite 

ingresar los valores en montos brutos 

\(incluyendo IVA\) para los detalles y sumar el 

total directamente como una multiplicación 

de los detalles por las cantidades. El total 

calculado de esta forma será ligeramente 

diferente al que se obtiene redondeando 

los montos netos y calculando el iva sobre 

el total neto. Los montos serán ajustados y 

guardados en facto como netos, pero 

respetando el redondeo sobre los brutos. 

Redondeo\_tipo 

string **opcional **

Permite ingresar como valores “neto” o 

“bruto”. 

- El redondeo sobre los brutos 

calculará el valor total de cada línea 

incluyendo el IVA, y luego ajustará 

los totales de IVA del documento 

para lograr que el valor final sea el 

indicado. 

- El redondeo sobre los netos 

calculará las multiplicaciones de los 

netos línea a línea y luego al total 

neto aplicará la multiplicación para 

obtener el IVA y el total. 

empresa\_email 

string **opcional **

Permite ingresar un email el cual 

reemplazará al registrado en los datos de la 

cuenta Facto y se verá reflejado en el email 

automático enviado a receptor del 

documento 

empresa\_web 

string **opcional **

Permite ingresar una url de sitio web el cual 

reemplazará al registrado en datos de la 

cuenta FACTO y se verá reflejado en el 

email automático enviado a receptor. 

Debe comenzar con http:// o https:// 

Ejemplo: http://www.google.com 



Encabezado 



**Elaborado por: **

**Revisado por: **

****

**Página 10 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Nombre 

Tipo 

Requerido/Opcional 

Descripción 

tipo\_dte 

Int 

**Requerido **

33 = Factura electrónica 

34 = Factura exenta electrónica 

39 = Boleta electrónica 

41 = Boleta exenta electrónica 

52 = Guía de despacho electrónica 

56 = Nota de débito electrónica 

61 = Nota de crédito electrónica 



110 = factura exportación electrónica 

111 = nota de débito de exportación 

electrónica 

112 = nota de crédito de exportación 

electrónica 

Fecha\_emision 

Date 

**Requerido **

Fecha emisión documento 

Formato YYYY-MM-DD 

Folio 

Int 

**Opcional **

Permite definir el folio a utilizar para 

emitir el documento. Por defecto este 

campo NO debería usarse, de manera que 

el folio sea asignado automáticamente por 

el correlativo de Facto. 

Los correlativos automáticos pueden ser 

editados en Facto, en la opción 

Administración >> Tipos de documento. 

ALERTA: En caso de usarse este campo, el 

documento será generado con el folio 

indicado y el correlativo interno de Facto 

NO será actualizado, por lo tanto pueden 

ocurrir errores de folio al intentar 

posteriormente emitir este tipo de 

documento usando el correlativo 

automático tanto por API o a través del 

portal de Facto. 

Receptor\_nombreinterno 

string 

Opcional 

Este campo permite buscar en Facto el 

cliente por su nombre interno y asociar el 

documento a este cliente. Es útil para 

casos de boletas no nominativas. En caso 

de completarse, el cliente debe existir 

previamente dentro de Facto con el 

nombre o código ingresado. 

Receptor\_rut 

String 

Requerido para facturas, RUT de receptor 

notas de crédito, notas 

RUT sin puntos con guión 

de débito, boletas 

Formato: NNNNNNNN-X 

**Elaborado por: **

**Revisado por: **

****

**Página 11 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** nominativas y boletas 



exentas nominativas 

En caso de documentos de exportación, 



corresponde al identificador tributario de 

Opcional para otros 

dicho país y puede tener otro formato 

documentos 

acorde al país de origen. 



En caso de contar con el COMPLEMENTO 

DE BOLETAS NOMINATIVAS, es posible 

generar boletas electrónicas de manera 

nominativa \(con datos de receptor igual 

que una factura\), para lo cual es 

obligatorio llenar este campo y el resto de 

los campos de receptor 

Receptor\_razon 

String 

Requerido para facturas, Razón social del receptor del documento notas de crédito, notas 



de débito, boletas 

nominativas y boletas 

exentas nominativas. 



Opcional para otros 

documentos 

Receptor\_direccion 

String 

Requerido para facturas, Dirección del receptor del documento notas de crédito, notas 



de débito, boletas 

nominativas y boletas 

exentas nominativas. 



Opcional para otros 

documentos 

Receptor\_comuna 

String 

Requerido para facturas, Comuna del receptor del documento notas de crédito, notas 



de débito, boletas 

nominativas y boletas 

exentas nominativas. 



Opcional para otros 

documentos 

Receptor\_ciudad 

String 

Requerido para facturas, Ciudad del receptor del documento notas de crédito, notas 

de débito, boletas 

nominativas y boletas 

exentas nominativas. 



**Elaborado por: **

**Revisado por: **

****

**Página 12 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Opcional para otros 

documentos 

Receptor\_telefono 

String 

Requerido para facturas, Teléfono del receptor del documento notas de crédito, notas 

de débito, boletas 

nominativas y boletas 

exentas nominativas. 



Opcional para otros 

documentos 

Receptor\_giro 

String 

Requerido para facturas, Giro del receptor del documento notas de crédito y notas 



de débito. 

Las boletas nominativas NO deben llevar 



este campo 

Opcional para otros 

documentos 

Receptor\_pais 

Int 

Opcional 

Corresponde al país del receptor. En caso 

de no enviarlo por defecto es Chile. Se 

utiliza principalmente para documentos 

de exportación. 



Ver tabla de países en Anexo final 

Condiciones\_pago 

String 

**Requerido **

Fechas de pago separadas por coma 

0 = contado 

30 = 30 días 

0,30 = 50% al contado, 50% a 30 días 

0,30,60 = 33% contado, 33% 30 días, 34% 

60 días 

Etc 

Receptor\_email 

String 

Opcional 

Email para envío de documento 

Identificador\_externo\_doc 

String 

Opcional 

Identificador que puede utilizarse por la 

aplicación externa para identificar a este 

documento generado 

Tipo\_guia 

Int 

**Requerido SOLO guías **

1 = Operación constituye venta 

**de despacho **

2 = Ventas por efectuar 

3 = Consignaciones 

4 = Entrega gratuita 

5 = Traslados internos 

6 = Otros traslados no venta 

7 = Guía de devolución 

8 = Traslado para exportación \(no venta\) 

9 = Venta para exportación 

**Elaborado por: **

**Revisado por: **

****

**Página 13 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Tipo\_traslado 

Int 

**Requerido SOLO guías **

1 = Despacho por cuenta del receptor 

**de despacho que no **

2 = Despacho por cuenta del emisor a 

**sean traslado interno **

instalaciones del receptor 

3 = Despacho por cuenta del emisor a 

otras instalaciones 

Sucursal 

string 

Opcional 

Este campo sólo debe completarse en 

caso de empresas que utilizan sucursales. 

Para emitir desde casa matriz, NO debe 

ingresarse este campo. 

El código que se ingrese debe 

corresponder al “código interno” 

ingresado en Facto. 

Observaciones 

String 

Opcional 

Ingresar una observación 

Observaciones\_despliegue 

int 

Opcional 

0 = no incluir observación en XML ni PDF 

1 = incluir observación en XML y PDF 

2 = incluir observación en PDF y NO incluir 

en XML 

3 = incluir observación en XML y NO incluir 

en PDF 



En todos los casos, sin importar su 

despliegue, la observación se guardará en 

Facto y será visible en el detalle de 

documento en facto.cl 



En caso de no ingresar esta opción, se 

considera por defecto el valor = 1 lo que 

desplegará la observación en el XML y 

PDF. 

Vendedor\_id 

Int 

Opcional 

Id de usuario Facto que se asignará como 

vendedor asociado al documento 

despacho\_direccion 

String 

Opcional 

Dirección a la cual se realizará el despacho 

peso\_bruto 

decimal Opcional 

Peso del despacho 

id\_tipo\_moneda 

Int 

Opcional 

Sólo para documentos de exportación. 

Valores válidos según tabla en anexos. 

valor\_tipo\_cambio 

Decimal Opcional 

Sólo cuando se encuentre moneda\_id 

definido y su valor no sea peso chileno. 

indicador\_servicio 

Int 

Sólo para documentos 

Es opcional que se complete para 

de exportación: opcional documentos de exportación. 

Valores válidos: 

1= Factura de servicios periódicos 

domiciliarios. 

2= Factura de otros servicios periódicos 

**Elaborado por: **

**Revisado por: **

****

**Página 14 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** 3= Factura de Servicios 

4= Servicios de Hotelería 

5= Servicio de Transporte Terrestre 

Internacional 

modalidad\_venta 

Int 

Sólo para documentos 

Es obligatorio que se complete para 

de exportación: 

documentos de exportación. 

Requerido 

Valores válidos: 

1= A Firme / Sale agreed 

2= Bajo condición / Under condition 

3= En consignación libre / Free 

consignation 

4= En consignación con mínimo firme / 

Consignation with minimum sale 

9= Sin pago / No payment 

clausula\_venta 

int 

Sólo para documentos 

Es obligatorio que se complete para 

de exportación: 

documentos de exportación. 

Requerido 

Valores válidos: 

1= CIF 

2= CFR 

3= EXW 

4= FAS 

5= FOB 

6= S/CL 

9= DDP 

10= FCA 

11= CPT 

12= CIP 

17= DAT 

18= DAP 

8= Otro 



Detalles 

Se pueden agregar tantos detalles como sea necesario repitiendo el tag <detalle> dentro de <detalles>, mínimo 1 ocurrencia. 



Nombre 

Tipo 

Requerido 

Descripción 

Cantidad 

decimal 

**Requerido **

Cantidad \(puede tener hasta 6 

decimales, separar por punto, 

no por coma\) 

Unidad 

String 

Opcional 

Texto de unidad \(Ej: kg\) 

**Elaborado por: **

**Revisado por: **

****

**Página 15 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Glosa 

String 

**Requerido **

Glosa de detalle 

Descripcionlarga 

String 

Opcional 

Permite agregar una 

descripción larga adicional a la 

glosa de detalle para el 

documento. 

sku 

String 

Opcional 

Permite ingresar el SKU de 

algún producto en inventario 

de Facto. En caso que el SKU 

ingresado corresponda 

exactamente con alguno del 

inventario, se realizará el 

movimiento de stock 

correspondiente al emitir el 

documento. 

Monto\_unitario 

decimal 

**Requerido **

Monto neto unitario \(puede 

tener hasta 6 decimales, 

separar por punto, no por 

coma\). En caso de usar opción 

“valores\_brutos” entonces 

debe ser el valor incluyendo 

IVA. 

Exento\_afecto 

Boolean 

**Requerido **

0 = exento de IVA 

1 = afecto a IVA 

Descuentorecargo\_monto 

Int 

Opcional 

Monto a descontar o recargar. 

Si es descuento usar negativo. 

Si se usa esto, no utilizar 

descuentorecargo\_porcentaje 

Descuentorecargo\_porcentaje 

Decimal 

Opcional 

Porcentaje a descontar o 

recargar. Si es descuento usar 

negativo. Si se usa esto, no 

utilizar 

descuentorecargo\_monto 

Impuesto\_codigo 

Int 

Opcional 

Indica el tipo de impuesto 

adicional que tiene esta fila. 

Ver anexo tabla de impuestos. 

NO soportado en caso de 

“valores\_brutos”. 

Impuesto\_valor 

decimal 

Opcional 

Sólo debe ingresarse para los 

impuestos que requieran 

ingreso manual, no debe 

ingresarse si no se ha 

seleccionado código de 

impuesto. 

**Elaborado por: **

**Revisado por: **

****

**Página 16 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Referencias 

Se pueden agregar tantas referencias como sea necesario agregando el tag <referencia> dentro de 

<referencias>. Es opcional, se utiliza para que una nota de crédito pueda referenciar a una factura que está modificando o anulando. En caso de otros documentos puede NO enviarse. 



Nombre 

Tipo 

Requerido 

Descripción 

Docreferencia\_tipo 

Int 

**Requerido **

33 = Factura electrónica 

34 = Factura exenta electrónica 

39 = Boleta electrónica 

41 = Boleta exenta electrónica 



Otros documentos que no son documentos 

tributarios electrónicos: \(debe usarse código 

referencia = 5\) 



801 = Orden de compra 

802 = Nota de pedido 

803 = Contrato 

804 = Resolución 

805 = Proceso ChileCompra 

806 = Ficha ChileCompra 

807 = DUS 

808 = B/L \(Conocimiento de embarque\) 

809 = AWB \(Air Will Bill\) 

810 = MIC/DTA 

811 = Carta de Porte 

812 = Resolución del SNA donde califica 

Servicios de Exportación 

813 = Pasaporte 

814 = Certificado de Depósito Bolsa Prod. 

Chile. 

815 = Vale de Prenda Bolsa Prod. Chile 



Docreferencia\_folio 

String 

**Requerido **

Número del documento referenciado. En 

caso de referencia global debe ser 0. 

Docreferencia\_fecha 

date 

Opcional** **

Sólo debe ingresarse cuando se utiliza una 

referencia que no es un documento 

tributario electrónico 

Código\_referencia 

Int 

**Requerido **

1 = anular 

**Elaborado por: **

**Revisado por: **

****

**Página 17 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** 2 = corregir texto 

3 = corregir cantidad 

4 = set 

5 = referencia a otros documentos no 

tributarios 

6 = referencia a guía de despacho 

7 = referencia global a un tipo de documento 

\(permite rebajar monto a todos los 

documentos de este tipo para este cliente en 

particular\) 

Descripcion 

String 

**Requerido **

Descripción de la referencia 



Descuentos/recargos globales 

Se pueden agregar tantos descuentos o recargos como sea necesario agregando el tag < descuentorecargoglobal> dentro de <descuentorecargoglobales>. Es opcional y puede no enviarse Nombre 

Tipo 

Requerido 

Descripción 

descrec 

string 

**Requerido **

DA = Descuento global a afectos 

DE = Descuento global a exentos 

RA = Recargo global a afectos 

RE = Recargo global a exentos 

valor 

decimal 

**Requerido **

Valor del descuento o recargo 

tipovalor 

String 

**Requerido **

$ = Valor se aplicará en monto 

% = Valor se aplicará en porcentaje sobre el 

monto 

glosa 

String 

**Opcional **

Descripción del descuento o recargo 

Totales 



Nombre 

Tipo 

Requerido 

Descripción 

Iva\_credito\_constructor

int 

Opcional 

Crédito 65% para empresas 

a 

constructoras. Artículo 21 del decreto ley 

N° 910/75. 

Este Es el único código que opera en 

forma opuesta al resto, ya que se resta 

al IVA general. Corresponde a IVA \* 0,65. 

NO soportado en caso de 

“valores\_brutos” 

**Elaborado por: **

**Revisado por: **

****

**Página 18 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Total\_exento 

Int 

**Requerido, **

Valor total ítems exentos. NO debe 

**excepto en caso **

ingresarse en caso de usar la opción 

**de valores brutos **“valores\_brutos” 

Total\_afecto 

Int 

**Requerido, **

Valor total ítems afectos. NO debe 

**excepto en caso **

ingresarse en caso de usar la opción 

**de valores brutos **“valores\_brutos”. 

Total\_iva 

Int 

**Requerido, **

IVA acorde al afecto. NO debe ingresarse 

**excepto en caso **

en caso de usar la opción 

**de valores brutos **“valores\_brutos”. 

Total\_otrosimpuestos 

Int 

Opcional 

Suma de otros impuestos, puede ser 

negativo si es que existen impuestos de 

retención. NO soportado en caso de 

“valores\_brutos” 

Total\_final 

Int 

**Requerido **

Valor final 



Servicio periódico 

Mediante tag <servicio\_periodico> 



Nombre 

Tipo 

Requerido 

Descripción 

medidor\_numero 

String 

Opcional 

Número de medidor 

medidor\_propiedad 

string 

opcional 

Propiedad \(Puede ser cliente, empresa, 

comodato, etc\) 

periodo\_desde 

date 

Opcional 

Fecha de inicio del periodo 

periodo\_hasta 

date 

Opcional** **

Fecha de fin del periodo 

lectura\_anterior 

Decimal 

Opcional** **

Lectura anterior del medidor 

lectura\_actual 

Decimal 

Opcional** **

Lectura actual del medidor 

consumo\_subtotal 

Decimal 

opcional 

Corresponde a la diferencia de las 

lecturas realizadas 

unidad\_medida 

string 

obligatorio 

Indicar la unidad de medida en que se 

realizan las lecturas y se considera el 

consumo. Ejemplo: m3, LTS, kWh, etc. 

**Elaborado por: **

**Revisado por: **

****

**Página 19 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** No necesariamente es la misma que se 

utiliza en el detalle. 

constante 

Decimal 

Opcional 

Constante por la cual se multiplica la 

diferencia de lectura 

consumo\_final 

decimal 

obligatorio** **

Valor final del consumo considerando la 

constante. Este valor debe luego 

cobrarse en el detalle según los precios 

que corresponda. El consumo será 

utilizado para el gráfico histórico del 

cliente en su boleta/factura. 



**Elaborado por: **

**Revisado por: **

****

**Página 20 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Respuesta de emisión de documento \(RESPONSE\) **

**Diagrama **



**Campos y significado **

Resultado 



**Elaborado por: **

**Revisado por: **

****

**Página 21 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Nombre 

Tipo 

Requerido/Opcional 

Descripción 

status 

Int 

**Requerido **

0 = se creó el borrador OK, se firmó y envió al SII OK 

1 = hay errores en el input por lo que no se generó el borrador ni tampoco se envió al SII. El detalle de los errores estará en <mensaje\_error> 

2 = se creó el borrador OK, sin embargo existen 

otros problemas \(falta de folios, falta de 

certificado, etc\) que no permitieron enviar al SII. El detalle de los errores estará en <mensaje\_error> Mensaje\_error 

string 

Opcional 

Detalle del error encontrado. 



Encabezado 

La respuesta de encabezado es idéntica a lo enviado con la diferencia de agregarse el número de folio del documento generado, el cual es asignado automáticamente por el correlativo de Facto. 



Nombre 

Tipo 

Requerido/Opcional 

Descripción 

tipo\_dte 

Int 

**Requerido **

33 = Factura electrónica 

34 = Factura exenta electrónica 

39 = Boleta electrónica 

41 = Boleta exenta electrónica 

folio 

Int 

**Requerido **

Corresponde al folio del nuevo documento 

generado. 

fecha\_emision 

Date 

**Requerido **

Fecha emisión documento 

Formato YYYY-MM-DD 

receptor\_rut 

String Opcional 

RUT de receptor 

Requerido para facturas 

RUT sin puntos con guión 

Formato: NNNNNNNN-X 

Receptor\_razon 

String Opcional 

Razón social receptor 

Requerido para facturas 

Receptor\_direccion 

String Opcional 

Dirección receptor 

Requerido para facturas 

Receptor\_comuna 

String Opcional 

Comuna receptor 

Requerido para facturas 

Receptor\_ciudad 

String Opcional 

Ciudad receptor 

Requerido para facturas 

Receptor\_telefono 

String Opcional 

Teléfono receptor 

Requerido para facturas 

Receptor\_giro 

String Opcional 

Giro del receptor 

Requerido para facturas 

**Elaborado por: **

**Revisado por: **

****

**Página 22 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Condiciones\_pago 

String **Requerido **

Fechas de pago separadas por coma 

0 = contado 

30 = 30 días 

0,30 = 50% al contado, 50% a 30 días 

0,30,60 = 33% contado, 33% 30 días, 34% 60 días 

Etc 

Receptor\_email 

String Opcional 

Email para envío de documento 

Orden\_compra\_num 

String Opcional 

Número de orden de compra 

Orden\_compra\_fecha 

Date 

Opcional 

Fecha de la orden de compra 



Detalles 



Nombre 

Tipo 

Requerido 

Descripción 

Cantidad 

decimal 

**Requerido **

Cantidad \(puede tener hasta 

6 decimales, separar por 

punto, no por coma\) 

Unidad 

String 

Opcional 

Texto de unidad \(Ej: kg\) 

Glosa 

String 

**Requerido **

Glosa de detalle 

Monto\_unitario 

decimal 

**Requerido **

Monto neto unitario \(puede 

tener hasta 6 decimales, 

separar por punto, no por 

coma\) 

Exento\_afecto 

Boolean 

**Requerido **

0 = exento de IVA 

1 = afecto a IVA 

Descuentorecargo\_monto 

Int 

Opcional 

Monto a descontar o 

recargar. Si es descuento 

usar negativo. Si se usa esto, 

no utilizar 

descuentorecargo\_porcentaje 

Descuentorecargo\_porcentaje Decimal 

Opcional 

Porcentaje a descontar o 

recargar. Si es descuento 

usar negativo. Si se usa esto, 

no utilizar 

descuentorecargo\_monto 





**Elaborado por: **

**Revisado por: **

****

**Página 23 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Referencias 



Nombre 

Tipo 

Requerido 

Descripción 

Docreferencia\_tipo 

Int 

**Requerido **

33 = Factura electrónica 

34 = Factura exenta 

electrónica 

39 = Boleta electrónica 

41 = Boleta exenta 

electrónica 

Docreferencia\_folio 

Int 

**Requerido **

Número del documento 

referenciado 

Código\_referencia 

Int 

**Requerido **

1 = anular 

2 = corregir texto 

3 = corregir cantidad 

4 = set 

Descripcion 

String 

**Requerido **

Descripción de la 

referencia 



Descuentos/recargos globales 



Nombre 

Tipo 

Requerido 

Descripción 

descrec 

string 

**Requerido **

DA = Descuento global a afectos 

DE = Descuento global a exentos 

RA = Recargo global a afectos 

RE = Recargo global a exentos 

valor 

decimal 

**Requerido **

Valor del descuento o recargo 

tipovalor 

String 

**Requerido **

$ = Valor se aplicará en monto 

% = Valor se aplicará en porcentaje sobre el 

monto 

glosa 

String 

**Opcional **

Descripción del descuento o recargo 





Totales 



Nombre 

Tipo 

Requerido 

Descripción 

**Elaborado por: **

**Revisado por: **

****

**Página 24 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** Iva\_credito\_constructora 

int 

Opcional** **

Crédito 65% para 

empresas 

constructoras. 

Artículo 21 del 

decreto ley N° 

910/75. 

Este Es el único 

código que opera en 

forma opuesta al 

resto, ya que se resta 

al IVA general. 

Corresponde a IVA \* 

0,65 

Total\_afecto 

Int 

**Requerido **

Valor total ítems 

afectos 

Total\_exento 

int 

**Requerido **

Valor total ítems 

exentos 

Total\_iva 

Int 

**Requerido **

IVA acorde al afecto 

Total\_final 

Int 

**Requerido **

Valor final 



Enlaces 

Los enlaces corresponden a links públicos desde los cuales se pueden descargar documentos generados para clientes. Tienen una vigencia de 30 días. 

Nombre 

Tipo 

Requerido/Opcional 

Descripción 

dte\_xml 

string 

**Requerido **

Link de descarga del DTE en formato XML del 

documento. Este es el XML que es enviado al SII. 

dte\_pdf 

string 

**Requerido **

Link de descarga del DTE en formato PDF del 

documento. Este PDF tendrá los logos y datos que 

se hayan completado en Facto. 

dte\_pdf\_cedible 

string 

Opcional 

Link de descarga de la copia cedible del DTE en 

formato PDF. Este link está presente sólo en 

documentos que tengan copia cedible como la 

factura y factura exenta. 

dte\_timbre 

String **Requerido **

Link de descarga de la imagen PNG del timbre 

electrónico del DTE. Este link se utiliza cuando el software que está haciendo la emisión va a 

generar la factura en un formato determinado 

diferente del que se envió en el PDF, y por lo tanto **Elaborado por: **

**Revisado por: **

****

**Página 25 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** se utiliza este timbre para agregarlo en donde 

corresponda. 





**Ejemplos de solicitudes y respuestas **



**Solicitud de factura con plantilla especial **

<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" 

xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:server"> 

<soapenv:Header/> 

<soapenv:Body> 

<urn:emitirDocumento soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"> 

<documento xsi:type="urn:emitir\_dte"> 

<opciones xsi:type="urn:opciones"> 



<id\_plantilla>10002</id\_plantilla> 



</opciones> 

<encabezado xsi:type="urn:encabezado"> 

<tipo\_dte xsi:type="xsd:string">33</tipo\_dte> 

<fecha\_emision xsi:type="xsd:date">2016-10-25</fecha\_emision> 

<receptor\_rut xsi:type="xsd:string">12345678-5</receptor\_rut> 

<receptor\_razon xsi:type="xsd:string">Prueba</receptor\_razon> 

<receptor\_direccion xsi:type="xsd:string">Alameda 123</receptor\_direccion> 

<receptor\_comuna xsi:type="xsd:string">Santiago</receptor\_comuna> 

<receptor\_ciudad xsi:type="xsd:string">Santiago</receptor\_ciudad> 

<receptor\_telefono xsi:type="xsd:string">1234</receptor\_telefono> 

<receptor\_giro xsi:type="xsd:string">Servicios</receptor\_giro> 

<condiciones\_pago xsi:type="xsd:string">0</condiciones\_pago> 

<receptor\_email xsi:type="xsd:string">soporte@facto.cl</receptor\_email> 

<identificador\_externo\_doc>1234</identificador\_externo\_doc> 

</encabezado> 

<detalles xsi:type="urn:detalles"> 

<detalle xsi:type="urn:detalle"> 

<cantidad xsi:type="xsd:int">1</cantidad> 

<unidad xsi:type="xsd:decimal">UN</unidad> 

<glosa xsi:type="xsd:string">Prueba</glosa> 

<monto\_unitario xsi:type="xsd:decimal">1000</monto\_unitario> 

<exento\_afecto xsi:type="xsd:boolean">1</exento\_afecto> 



<impuesto\_codigo xsi:type="xsd:int">8</impuesto\_codigo> 



<impuesto\_valorunitario xsi:type="xsd:decimal">300</impuesto\_valorunitario> 

</detalle> 

</detalles> 

<totales xsi:type="urn:totales"> 

<total\_exento xsi:type="xsd:int">0</total\_exento> 

<total\_afecto xsi:type="xsd:int">1000</total\_afecto> 

<total\_iva xsi:type="xsd:int">190</total\_iva> 



<total\_otrosimpuestos xsi:type=”xsd:int”>300</total\_otrosimpuestos> 

<total\_final xsi:type="xsd:int">1490</total\_final> 

</totales> 

**Elaborado por: **

**Revisado por: **

****

**Página 26 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido **





</documento> 

</urn:emitirDocumento> 

</soapenv:Body> 

</soapenv:Envelope> 



**Solicitud nota de crédito **

<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" 

xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:server"> 

<soapenv:Header/> 

<soapenv:Body> 

<urn:emitirDocumento soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"> 

<documento xsi:type="urn:emitir\_dte"> 

<encabezado xsi:type="urn:encabezado"> 

<tipo\_dte xsi:type="xsd:string">61</tipo\_dte> 

<fecha\_emision xsi:type="xsd:date">2016-10-25</fecha\_emision> 

<receptor\_rut xsi:type="xsd:string">12345678-5</receptor\_rut> 

<receptor\_razon xsi:type="xsd:string">Prueba</receptor\_razon> 

<receptor\_direccion xsi:type="xsd:string">Alameda 123</receptor\_direccion> 

<receptor\_comuna xsi:type="xsd:string">Santiago</receptor\_comuna> 

<receptor\_ciudad xsi:type="xsd:string">Santiago</receptor\_ciudad> 

<receptor\_telefono xsi:type="xsd:string">1234</receptor\_telefono> 

<receptor\_giro xsi:type="xsd:string">Servicios</receptor\_giro> 

<condiciones\_pago xsi:type="xsd:string">0</condiciones\_pago> 

<receptor\_email xsi:type="xsd:string">soporte@facto.cl</receptor\_email> 

</encabezado> 

<detalles xsi:type="urn:detalles"> 

<detalle xsi:type="urn:detalle"> 

<cantidad xsi:type="xsd:int">1</cantidad> 

<unidad xsi:type="xsd:decimal">UN</unidad> 

<glosa xsi:type="xsd:string">Prueba</glosa> 

<monto\_unitario xsi:type="xsd:decimal">1000</monto\_unitario> 

<exento\_afecto xsi:type="xsd:boolean">1</exento\_afecto> 

</detalle> 

</detalles> 

<referencias xsi:type="urn:referencias"> 

<referencia xsi:type="urn:referencia"> 

<docreferencia\_tipo xsi:type="xsd:int">33</docreferencia\_tipo> 

<docreferencia\_folio xsi:type="xsd:int">1412</docreferencia\_folio> 

<codigo\_referencia xsi:type="xsd:int">1</codigo\_referencia> 

<descripcion xsi:type="xsd:string">Devolución producto</descripcion> 

</referencia> 

</referencias> 

<totales xsi:type="urn:totales"> 

<total\_exento xsi:type="xsd:int">0</total\_exento> 

<total\_afecto xsi:type="xsd:int">1000</total\_afecto> 

<total\_iva xsi:type="xsd:int">190</total\_iva> 

<total\_final xsi:type="xsd:int">1190</total\_final> 

</totales> 

</documento> 

</urn:emitirDocumento> 

</soapenv:Body> 

</soapenv:Envelope> 

**Elaborado por: **

**Revisado por: **

****

**Página 27 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Solicitud guía de despacho **

<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" 

xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:server"> 

<soapenv:Header/> 

<soapenv:Body> 

<urn:emitirDocumento soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"> 

<documento xsi:type="urn:emitir\_dte"> 

<encabezado xsi:type="urn:encabezado"> 

<tipo\_dte xsi:type="xsd:string">52</tipo\_dte> 

<fecha\_emision xsi:type="xsd:date">2016-10-25</fecha\_emision> 

<receptor\_rut xsi:type="xsd:string">12345678-5</receptor\_rut> 

<receptor\_razon xsi:type="xsd:string">Prueba</receptor\_razon> 

<receptor\_direccion xsi:type="xsd:string">Alameda 123</receptor\_direccion> 

<receptor\_comuna xsi:type="xsd:string">Santiago</receptor\_comuna> 

<receptor\_ciudad xsi:type="xsd:string">Santiago</receptor\_ciudad> 

<receptor\_telefono xsi:type="xsd:string">1234</receptor\_telefono> 

<receptor\_giro xsi:type="xsd:string">Servicios</receptor\_giro> 

<condiciones\_pago xsi:type="xsd:string">0</condiciones\_pago> 

<receptor\_email xsi:type="xsd:string">prueba@prueba.cl</receptor\_email> 

<tipo\_guia>1</tipo\_guia> 

<tipo\_traslado>1</tipo\_traslado> 

</encabezado> 

<detalles xsi:type="urn:detalles"> 

<detalle xsi:type="urn:detalle"> 

<cantidad xsi:type="xsd:int">1</cantidad> 

<unidad xsi:type="xsd:decimal">UN</unidad> 

<glosa xsi:type="xsd:string">Prueba</glosa> 

<monto\_unitario xsi:type="xsd:decimal">1000</monto\_unitario> 

<exento\_afecto xsi:type="xsd:boolean">1</exento\_afecto> 

</detalle> 

</detalles> 

<totales xsi:type="urn:totales"> 

<total\_exento xsi:type="xsd:int">0</total\_exento> 

<total\_afecto xsi:type="xsd:int">1000</total\_afecto> 

<total\_iva xsi:type="xsd:int">190</total\_iva> 

<total\_final xsi:type="xsd:int">1190</total\_final> 

</totales> 

</documento> 

</urn:emitirDocumento> 

</soapenv:Body> 

</soapenv:Envelope> 



**Solicitud de boleta electrónica **

<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" 

xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:server"> 

<soapenv:Header/> 

<soapenv:Body> 

**Elaborado por: **

**Revisado por: **

****

**Página 28 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido **





<urn:emitirDocumento soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"> 

<documento xsi:type="urn:emitir\_dte"> 

<encabezado xsi:type="urn:encabezado"> 

<tipo\_dte xsi:type="xsd:string">39</tipo\_dte> 

<fecha\_emision xsi:type="xsd:date">2016-10-25</fecha\_emision> 

<receptor\_rut xsi:type="xsd:string"></receptor\_rut> 

<receptor\_razon xsi:type="xsd:string"> </receptor\_razon> 

<receptor\_direccion xsi:type="xsd:string"> </receptor\_direccion> 

<receptor\_comuna xsi:type="xsd:string"> </receptor\_comuna> 

<receptor\_ciudad xsi:type="xsd:string"> </receptor\_ciudad> 

<receptor\_telefono xsi:type="xsd:string"></receptor\_telefono> 

<receptor\_giro xsi:type="xsd:string"> </receptor\_giro> 

<condiciones\_pago xsi:type="xsd:string">0</condiciones\_pago> 

<receptor\_email xsi:type="xsd:string">soporte@facto.cl</receptor\_email> 

<identificador\_externo\_doc>1234</identificador\_externo\_doc> 

</encabezado> 

<detalles xsi:type="urn:detalles"> 

<detalle xsi:type="urn:detalle"> 

<cantidad xsi:type="xsd:int">1</cantidad> 

<unidad xsi:type="xsd:decimal">UN</unidad> 

<glosa xsi:type="xsd:string">Prueba</glosa> 

<monto\_unitario xsi:type="xsd:decimal">1000</monto\_unitario> 

<exento\_afecto xsi:type="xsd:boolean">1</exento\_afecto> 



<impuesto\_codigo xsi:type="xsd:int">8</impuesto\_codigo> 



<impuesto\_valorunitario xsi:type="xsd:decimal">300</impuesto\_valorunitario> 

</detalle> 

</detalles> 

<totales xsi:type="urn:totales"> 

<total\_exento xsi:type="xsd:int">0</total\_exento> 

<total\_afecto xsi:type="xsd:int">1000</total\_afecto> 

<total\_iva xsi:type="xsd:int">190</total\_iva> 



<total\_otrosimpuestos xsi:type=”xsd:int”>300</total\_otrosimpuestos> 

<total\_final xsi:type="xsd:int">1490</total\_final> 

</totales> 

</documento> 

</urn:emitirDocumento> 

</soapenv:Body> 

</soapenv:Envelope> 

**Solicitud de factura con retención de impuesto **

<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" 

xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:server"> 

<soapenv:Header/> 

<soapenv:Body> 

<urn:emitirDocumento soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"> 

<documento xsi:type="urn:emitir\_dte"> 

<encabezado xsi:type="urn:encabezado"> 

<tipo\_dte xsi:type="xsd:string">33</tipo\_dte> 

<fecha\_emision xsi:type="xsd:date">2016-10-25</fecha\_emision> 

<receptor\_rut xsi:type="xsd:string">12345678-5</receptor\_rut> 

<receptor\_razon xsi:type="xsd:string">Prueba</receptor\_razon> 

<receptor\_direccion xsi:type="xsd:string">Alameda 123</receptor\_direccion> 

<receptor\_comuna xsi:type="xsd:string">Santiago</receptor\_comuna> 

<receptor\_ciudad xsi:type="xsd:string">Santiago</receptor\_ciudad> **Elaborado por: **

**Revisado por: **

****

**Página 29 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido **





<receptor\_telefono xsi:type="xsd:string">1234</receptor\_telefono> 

<receptor\_giro xsi:type="xsd:string">Servicios</receptor\_giro> 

<condiciones\_pago xsi:type="xsd:string">0</condiciones\_pago> 

<receptor\_email xsi:type="xsd:string">soporte@facto.cl</receptor\_email> 

<identificador\_externo\_doc>1234</identificador\_externo\_doc> 

</encabezado> 

<detalles xsi:type="urn:detalles"> 

<detalle xsi:type="urn:detalle"> 

<cantidad xsi:type="xsd:int">1</cantidad> 

<unidad xsi:type="xsd:decimal">UN</unidad> 

<glosa xsi:type="xsd:string">Prueba</glosa> 

<monto\_unitario xsi:type="xsd:decimal">1000</monto\_unitario> 

<exento\_afecto xsi:type="xsd:boolean">1</exento\_afecto> 



<impuesto\_codigo xsi:type="xsd:int">38</impuesto\_codigo> 



<impuesto\_valorunitario xsi:type="xsd:decimal">-190</impuesto\_valorunitario> 

</detalle> 

</detalles> 

<totales xsi:type="urn:totales"> 

<total\_exento xsi:type="xsd:int">0</total\_exento> 

<total\_afecto xsi:type="xsd:int">1000</total\_afecto> 

<total\_iva xsi:type="xsd:int">190</total\_iva> 



<total\_otrosimpuestos xsi:type=”xsd:int”>-190</total\_otrosimpuestos> 

<total\_final xsi:type="xsd:int">1000</total\_final> 

</totales> 

</documento> 

</urn:emitirDocumento> 

</soapenv:Body> 

</soapenv:Envelope> 





**Solicitud de boleta con valores\_brutos activado **

<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:server"> 

<soapenv:Header/> 

<soapenv:Body> 

<urn:emitirDocumento> 

<documento> 

<opciones> 

<valores\_brutos>1</valores\_brutos> 

</opciones> 



<encabezado> 

<tipo\_dte>39</tipo\_dte> 

<fecha\_emision>2020-08-21</fecha\_emision> 

<condiciones\_pago>0</condiciones\_pago> 

</encabezado> 



<detalles> 

<detalle> 

<cantidad>1</cantidad> 

<unidad>L</unidad> 

<glosa>Agua Mineral</glosa> 

**Elaborado por: **

**Revisado por: **

****

**Página 30 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido **





<sku>1221</sku> 

<monto\_unitario>500</monto\_unitario> 

<exento\_afecto>1</exento\_afecto> 

</detalle> 

</detalles> 





<totales> 





<total\_final>500</total\_final> 

</totales> 

</documento> 

</urn:emitirDocumento> 

</soapenv:Body> 

</soapenv:Envelope> 



**Solicitud de factura electrónica exportación **

<?xml version="1.0" encoding="UTF-8"?> 

<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"> 

<soap:Body> 

<ns1:emitirDocumento xmlns:ns1="urn:server"> 

<documento> 





<encabezado> 





<tipo\_dte>110</tipo\_dte> 





<fecha\_emision>2023-07-18</fecha\_emision> 





<indicador\_servicio>5</indicador\_servicio> 





<receptor\_rut>55555555-5</receptor\_rut> 





<receptor\_razon>Razón social prueba con cliente extranjero</receptor\_razon> 





<nacionalidad>202</nacionalidad> 





<receptor\_giro>VENTA AL POR MENOR POR CORREO, POR INTER</receptor\_giro> 





<contacto>99999999</contacto> 





<receptor\_direccion>VITAL APOQUINDO 237</receptor\_direccion> 





<receptor\_ciudad>SANTIAGO</receptor\_ciudad> 





<receptor\_comuna>SANTIAGO</receptor\_comuna> 





<condiciones\_pago>0</condiciones\_pago> 

<observaciones>ninguna</observaciones> 

<id\_tipo\_moneda>5</id\_tipo\_moneda> 

<valor\_tipo\_cambio>800</valor\_tipo\_cambio> 





<modalidad\_venta>2</modalidad\_venta> 





<clausula\_venta>1</clausula\_venta> 





</encabezado> 





<totales> 





<descuentorecargo\_global\_valor xsi:type="xsd:string" /> 



<total\_afecto xsi:type="xsd:string">8</total\_afecto> 



<total\_iva xsi:type="xsd:string" >2</total\_iva> 



<total\_final xsi:type="xsd:string">10</total\_final> 





</totales> 





<detalles> 





<detalle> 





<cantidad xsi:type="xsd:string">1</cantidad> 





<unidad xsi:type="xsd:string">UN</unidad> 



<glosa xsi:type="xsd:string">FLASH</glosa> 



<descripcionlarga xsi:type="xsd:string">aaaa</descripcionlarga> 



<monto\_unitario xsi:type="xsd:string">4</monto\_unitario> 



<exento\_afecto xsi:type="xsd:string">1</exento\_afecto> 



<descuentorecargo\_monto xsi:type="xsd:string" /> 



<descuentorecargo\_porcentaje xsi:type="xsd:string" /> **Elaborado por: **

**Revisado por: **

****

**Página 31 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido **





</detal e> 





<detalle> 



<cantidad xsi:type="xsd:string">1</cantidad> 



<unidad xsi:type="xsd:string">UN</unidad> 



<glosa xsi:type="xsd:string">eeee</glosa> 



<descripcionlarga xsi:type="xsd:string">eeee</descripcionlarga> 



<monto\_unitario xsi:type="xsd:string">4</monto\_unitario> 



<exento\_afecto xsi:type="xsd:string">1</exento\_afecto> 



<descuentorecargo\_monto xsi:type="xsd:string" /> 



<descuentorecargo\_porcentaje xsi:type="xsd:string" /> 



</detalle> 





</detal es> 





</documento> 

</ns1:emitirDocumento> 

</soap:Body> 

</soap:Envelope> 



**Respuesta documento creado exitosamente y enviado al SII \(status = 0\) **

<SOAP-ENV:Envelope SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAPENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" 

xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"> 

<SOAP-ENV:Body> 

<ns1:emitirDocumentoResponse xmlns:ns1="urn:server"> 

<return xsi:type="xsd:complexType"> 

<resultado> 

<status>0</status> 

</resultado> 

<encabezado> 

<tipo\_dte>33</tipo\_dte> 

<folio>4033</folio> 

<fecha\_emision>2016-10-28</fecha\_emision> 

<receptor\_rut>12345678-5</receptor\_rut> 

<receptor\_razon>Prueba</receptor\_razon> 

<receptor\_direccion>Alameda 123</receptor\_direccion> 

<receptor\_comuna>Santiago</receptor\_comuna> 

<receptor\_ciudad>Santiago</receptor\_ciudad> 

<receptor\_telefono>1234</receptor\_telefono> 

<receptor\_giro>Servicios</receptor\_giro> 

<condiciones\_pago>0</condiciones\_pago> 

<receptor\_email>mforetic@oml.cl</receptor\_email> 

<identificador\_externo\_doc>1234</identificador\_externo\_doc> 

</encabezado> 

<detalles> 

<cantidad>1</cantidad> 

<unidad>0</unidad> 

<glosa>Prueba</glosa> 

<monto\_unitario>1000</monto\_unitario> 

<exento\_afecto>1</exento\_afecto> 

</detalles> 

<totales> 

<total\_exento>0</total\_exento> 

<total\_afecto>1000</total\_afecto> 

<total\_iva>190</total\_iva> 

<total\_final>1190</total\_final> 

**Elaborado por: **

**Revisado por: **

****

**Página 32 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido **





</totales> 

<enlaces> 

<dte\_xml>https://descarga.facto.cl/2016/11/981c272344fc8a20fdbdc70e50c4c2ced.xml</dte\_xml> 

<dte\_pdf>https://descarga.facto.cl/2016/11/17a2e79e213dbf11075b25c928833aacb.pdf</dte\_pdf> 

<dte\_pdfcedible>https://descarga.facto.cl/2016/11/aa1d8580e7f782707c97217ac9e81c5s4.pdf</dte\_pdfcedible> 

<dte\_timbre>https://descarga.facto.cl/2016/11/420075f72e0afb9506bc4f40d17527v18.png</dte\_timbre> 

</enlaces> 

</return> 

</ns1:emitirDocumentoResponse> 

</SOAP-ENV:Body> 

</SOAP-ENV:Envelope> 





**Respuesta de documento no creado por descuadre de totales \(status = 1\) **

<SOAP-ENV:Envelope SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAPENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" 

xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"> 

<SOAP-ENV:Body> 

<ns1:emitirDocumentoResponse xmlns:ns1="urn:server"> 

<return xsi:type="xsd:complexType"> 

<resultado> 

<status>1</status> 

<mensaje\_error>Total Neto \(2000\) no coincide con suma de detalles netos \(1000\)</mensaje\_error> 

</resultado> 

<encabezado> 

<tipo\_dte>33</tipo\_dte> 

<folio>4033</folio> 

<fecha\_emision>2016-10-28</fecha\_emision> 

<receptor\_rut>12345678-5</receptor\_rut> 

<receptor\_razon>Prueba</receptor\_razon> 

<receptor\_direccion>Alameda 123</receptor\_direccion> 

<receptor\_comuna>Santiago</receptor\_comuna> 

<receptor\_ciudad>Santiago</receptor\_ciudad> 

<receptor\_telefono>1234</receptor\_telefono> 

<receptor\_giro>Servicios</receptor\_giro> 

<condiciones\_pago>0</condiciones\_pago> 

<receptor\_email>mforetic@oml.cl</receptor\_email> 

<identificador\_externo\_doc>1234</identificador\_externo\_doc> 

</encabezado> 

<detalles> 

<cantidad>1</cantidad> 

<unidad>0</unidad> 

<glosa>Prueba</glosa> 

<monto\_unitario>1000</monto\_unitario> 

<exento\_afecto>1</exento\_afecto> 

</detalles> 

<totales> 

<total\_exento>0</total\_exento> 

<total\_afecto>2000</total\_afecto> 

<total\_iva>380</total\_iva> 

<total\_final>2380</total\_final> 

**Elaborado por: **

**Revisado por: **

****

**Página 33 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido **





</totales> 

<enlaces> 

<dte\_xml></dte\_xml> 

<dte\_pdf></dte\_pdf> 

<dte\_pdfcedible></dte\_pdfcedible> 

<dte\_timbre></dte\_timbre> 

</enlaces> 

</return> 

</ns1:emitirDocumentoResponse> 

</SOAP-ENV:Body> 

</SOAP-ENV:Envelope> 





**Respuesta de documento creado como borrador pero no enviado al SII** **\(status = 2\) **

<SOAP-ENV:Envelope SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAPENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" 

xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/"> 

<SOAP-ENV:Body> 

<ns1:emitirDocumentoResponse xmlns:ns1="urn:server"> 

<return xsi:type="xsd:complexType"> 

<resultado> 

<status>2</status> 

<mensaje\_error>Documento generado pero no fue posible enviar al S.I.I. - No fue posible autentificarse en servicio S.I.I. con el certificado digital seleccionado -</mensaje\_error> 

</resultado> 

<encabezado> 

<tipo\_dte>33</tipo\_dte> 

<folio>4033</folio> 

<fecha\_emision>2016-10-28</fecha\_emision> 

<receptor\_rut>12345678-5</receptor\_rut> 

<receptor\_razon>Prueba</receptor\_razon> 

<receptor\_direccion>Alameda 123</receptor\_direccion> 

<receptor\_comuna>Santiago</receptor\_comuna> 

<receptor\_ciudad>Santiago</receptor\_ciudad> 

<receptor\_telefono>1234</receptor\_telefono> 

<receptor\_giro>Servicios</receptor\_giro> 

<condiciones\_pago>0</condiciones\_pago> 

<receptor\_email>mforetic@oml.cl</receptor\_email> 

<orden\_compra\_num>1234</orden\_compra\_num> 

<orden\_compra\_fecha>2016-07-25</orden\_compra\_fecha> 

</encabezado> 

<detalles> 

<cantidad>1</cantidad> 

<unidad>0</unidad> 

<glosa>Prueba</glosa> 

<monto\_unitario>1000</monto\_unitario> 

<exento\_afecto>1</exento\_afecto> 

**Elaborado por: **

**Revisado por: **

****

**Página 34 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido **





</detalles> 

<totales> 

<total\_exento>0</total\_exento> 

<total\_afecto>1000</total\_afecto> 

<total\_iva>190</total\_iva> 

<total\_final>1190</total\_final> 

</totales> 

<enlaces> 

<dte\_xml>https://descarga.facto.cl/2016/11/981c272344fc8a20fdbdc70e50c4c2ced.xml</dte\_xml> 

<dte\_pdf>https://descarga.facto.cl/2016/11/17a2e79e213dbf11075b25c928833aacb.pdf</dte\_pdf> 

<dte\_pdfcedible>https://descarga.facto.cl/2016/11/aa1d8580e7f782707c97217ac9e81c5s4.pdf</dte\_pdfcedible> 

<dte\_timbre>https://descarga.facto.cl/2016/11/420075f72e0afb9506bc4f40d17527v18.png</dte\_timbre> 

</enlaces> 

</return> 

</ns1:emitirDocumentoResponse> 

</SOAP-ENV:Body> 

</SOAP-ENV:Envelope> 





**Anexo: Tabla de impuestos adicionales **

Para aquellos que indicant una tasa determinada, no debe ingresarse como parte del detalle, sólo realizarse el cálculo en los totales 

Código 

Nombre 

Tasa 

Código SII 

Observaciones 

impuesto 

equivalente 

1 

Art de oro, Joyas y Pieles finas 15% 

15% 

23 



2 

Tapices, Casas rod. Caviar y Arm de 

15% 

44 



aire 15% 

3 

Licores, Pisco, Destilados 31,5% 

31,5% 

24 



4 

Vinos, Chichas, Sidras 20,5% 

20,5% 

25 



5 

Cervezas y Otras bebidas alcohólicas 

20,5% 

26 



20,5% 

6 

Aguas minerales y Beb. analcohól. 

10% 

27 



10% 

7 

Beb. analcohól. elevado cont azucar 

18% 

271 



18% 

8 

Impuesto específico diesel 

Ingreso 

28 

Debe completarse el 

manual 

valor del impuesto 

para cada detalle 

9 

Impuesto específico gasolina 

Ingreso 

35 

Debe completarse el 

manual 

valor del impuesto 

para cada detalle 

**Elaborado por: **

**Revisado por: **

****

**Página 35 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** 10 

Pirotecnia 50% primera venta 

Ingreso 

45 

Debe completarse el 

manual 

valor del impuesto 

para cada detalle 

11 

Impuesto gas natural 

Ingreso 

51 

Debe completarse el 

manual 

valor del impuesto 

para cada detalle 

12 

Impuesto gas licuado 

Ingreso 

52 

Debe completarse el 

manual 

valor del impuesto 

para cada detalle 

13 

Impuesto retenido suplementeros 

Ingreso 

53 

Debe completarse el 

manual 

valor del impuesto 

para cada detalle 

15 

IVA Faenamiento Carne 5% 

5% 

17 



16 

IVA Anticipado Carne 5% 

5% 

18 



17 

IVA Anticipado Harina 12% 

12% 

19 



18 

IVA Retenido Construcción 

-19% 

41 

Este impuesto de 

retención resta al 

total, por lo que debe 

restarse como un 

negativo en la 

totalización de 

impuestos. 

19 

IVA Retenido Total 

-19% 

15 

Este impuesto de 

retención resta al 

total, por lo que debe 

restarse como un 

negativo en la 

totalización de 

impuestos. 

20 

IVA Retenido Cartones 

-19% 

47 

Este impuesto de 

retención resta al 

total, por lo que debe 

restarse como un 

negativo en la 

totalización de 

impuestos. 

21 

IVA Margen de comercialización 

19% 

14 



22 

IVA Retenido Chatarra 

-19% 

38 

Este impuesto de 

retención resta al 

**Elaborado por: **

**Revisado por: **

****

**Página 36 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** total, por lo que debe 

restarse como un 

negativo en la 

totalización de 

impuestos. 





**Anexo: Tabla de países **



**Nombre País **

**Código **

AFGANISTAN 

308 

ALBANIA 

518 

ALEMANIA 

563 

ALEMANIA R.D.\(N 

503 

ALEMANIA R.F. 

502 

ALTO VOLTA 

132 

ANDORRA 

525 

ANGOLA 

140 

ANGUILA 

242 

ANTIGUA Y BBUDA 

240 

ANTILLAS NEERLANDESA 

247 

ARABIA SAUDITA 

302 

ARGELIA 

127 

ARGENTINA 

224 

ARMENIA 

540 

ARUBA 

243 

AUSTRALIA 

406 

AUSTRIA 

509 

AZERBAIJAN 

541 

BAHAMAS 

207 

BAHREIN 

313 

BANGLADESH 

321 

BARBADOS 

204 

BELARUS 

542 

BELGICA 

514 

BELICE 

236 

BENIN 

150 

**Elaborado por: **

**Revisado por: **

****

**Página 37 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Nombre País **

**Código **

BERMUDAS 

244 

BHUTAN 

318 

BOLIVIA 

221 

BOPHUTHATSWANA 

154 

BOSNIA HEZGVINA 

543 

BOTSWANA 

113 

BRASIL 

220 

BRUNEI 

344 

BULGARIA 

527 

BURKINA FASO 

161 

BURUNDI 

141 

CABO VERDE 

129 

CAMBODIA 

315 

CAMERUN 

149 

CANADA 

226 

CHAD 

130 

CHECOESLOVAQUIA 

529 

CHILE 

997 

CHINA 

336 

CHIPRE 

305 

CISKEY 

162 

COLOMBIA 

202 

COMB.Y LUBRIC. 

901 

COMORAS 

118 

CONGO 

144 

COREA DEL NORTE 

334 

COREA DEL SUR 

333 

COSTA DE MARFIL 

107 

COSTA RICA 

211 

CROACIA 

547 

CUBA 

209 

DEPOSITO FRANCO 

906 

DINAMARCA 

507 

DJIBOUTI 

155 

DOMINICA 

231 

ECUADOR 

218 

EGIPTO 

124 

EL SALVADOR 

213 

EMIR.ARAB.UNID. 

341 

**Elaborado por: **

**Revisado por: **

****

**Página 38 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Nombre País **

**Código **

ERITREA 

163 

ESLOVENIA 

548 

ESPANA 

517 

ESTONIA 

549 

ETIOPIA 

139 

FIJI 

401 

FILIPINAS 

335 

FINLANDIA 

512 

FRANCIA 

505 

GABON 

145 

GAMBIA 

102 

GEORGIA 

550 

GHANA 

108 

GIBRALTAR 

565 

GILBRALTAR 

585 

GRANADA 

232 

GRECIA 

520 

GROENLANDIA 

253 

GUAM 

425 

GUATEMALA 

215 

GUERNSEY 

566 

GUINEA 

104 

GUINEA ECUATRL 

147 

GUINEA-BISSAU 

103 

GUYANA 

217 

HAITI 

208 

HOLANDA 

515 

HONDURAS 

214 

HONG KONG 

342 

HUNGRIA 

530 

INDIA 

317 

INDONESIA 

328 

IRAK 

307 

IRAN 

309 

IRLANDA 

506 

ISLA DE MAN 

567 

ISLANDIA 

516 

ISLAS CAYMAN 

246 

ISLAS COOK 

427 

**Elaborado por: **

**Revisado por: **

****

**Página 39 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Nombre País **

**Código **

ISLAS MALDIVAS 

327 

ISLAS MARIANAS DEL NORTE 

424 

ISLAS MARSHALL 

164 

ISLAS SALOMON 

418 

ISLAS TONGA 

403 

ISLAS VIRG.BRIT 

245 

ISLAS VIRGENES \(ESTADOS UNIDOS 249 

ISRAEL 

306 

ITALIA 

504 

JAMAICA 

205 

JAPON 

331 

JERSEY 

568 

JORDANIA 

301 

KASAJSTAN 

551 

KENIA 

137 

KIRGISTAN 

552 

KIRIBATI 

416 

KUWAIT 

303 

LAOS 

316 

LESOTHO 

114 

LETONIA 

553 

LIBANO 

311 

LIBERIA 

106 

LIBIA 

125 

LIECHTENSTEIN 

534 

LITUANIA 

554 

LUXEMBURGO 

532 

MACAO 

345 

MACEDONIA 

555 

MADAGASCAR 

120 

MALASIA 

329 

MALAWI 

115 

MALI 

133 

MALTA 

523 

MARRUECOS 

128 

MARTINICA 

250 

MAURICIO 

119 

MAURITANIA 

134 

MEXICO 

216 

**Elaborado por: **

**Revisado por: **

****

**Página 40 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Nombre País **

**Código **

MICRONESIA 

417 

MOLDOVA 

556 

MONACO 

535 

MONGOLIA 

337 

MONSERRAT 

252 

MONTENEGRO 

561 

MOZAMBIQUE 

121 

MYANMAR \(EX BIR 

326 

NAC.REPUTADA 

998 

NAMIBIA 

159 

NAURU 

402 

NEPAL 

320 

NICARAGUA 

212 

NIGER 

131 

NIGERIA 

111 

NIUE 

421 

NORUEGA 

513 

NUEVA CALEDONIA 

423 

NUEVA ZELANDIA 

405 

OMAN 

304 

ORIG.O DEST. NO 

904 

OTROS\(PAIS DESC 

999 

PAKISTAN 

324 

PALAU 

420 

PANAMA 

210 

PARAGUAY 

222 

PERU 

219 

PESCA EXTRA 

903 

POLINESIA FRANCESA 

422 

POLONIA 

528 

PORTUGAL 

501 

PPUA.NVA.GUINEA 

412 

PUERTO RICO 

251 

QATAR 

312 

RANCHO DE NAVES 

902 

REINO UNIDO 

510 

REP.CENT.AFRIC. 

148 

REP.DEM. CONGO 

143 

REP.DOMINICANA 

206 

**Elaborado por: **

**Revisado por: **

****

**Página 41 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Nombre País **

**Código **

REP.ESLOVACA 

545 

REPUBLICA CHECA 

544 

REPUBLICA DE SERBIA 

546 

REPUBLICA DE YEMEN 

346 

RF YUGOSLAVIA 

564 

RUMANIA 

519 

RUSIA 

562 

RWANDA 

142 

S.TOM.PRINCIPE 

146 

S.VTE.Y GRANAD. 

234 

SAHARAUI 

165 

SAMOA OCC. 

404 

SAN MARINO 

536 

SANTA LUCIA\(ISL 

233 

SANTA SEDE 

524 

SENEGAL 

101 

SEYCHELLES 

156 

SIERRA LEONA 

105 

SINGAPUR 

332 

SIRIA 

310 

SNT.KIT & NEVIS 

241 

SOMALIA 

138 

SRI LANKA 

314 

SUDAFRICA 

112 

SUDAN 

123 

SUDAN DEL SUR 

160 

SUECIA 

511 

SUIZA 

508 

SURINAM 

235 

SWAZILANDIA 

122 

T.NORTEAM.EN AU 

409 

TADJIKISTAN 

557 

TAIWAN \(FORMOSA 

330 

TANZANIA 

135 

TER.ESPAN.EN AF 

152 

TER.HOLAN.EN AM 

229 

TER.PORTUG.E/AS 

343 

TERR.BRIT.EN AF 

151 

TERR.BRIT.EN AM 

227 

**Elaborado por: **

**Revisado por: **

****

**Página 42 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Nombre País **

**Código **

TERR.BRIT.EN AU 

407 

TERR.D/DINAMARC 

230 

TERR.FRAN.EN AF 

153 

TERR.FRAN.EN AM 

228 

TERR.FRAN.EN AU 

408 

THAILANDIA 

319 

TIMOR ORIENTAL 

426 

TOGO 

109 

TRANSKEI 

166 

TRINID.Y TOBAGO 

203 

TUNEZ 

126 

TURCAS Y CAICOS 

248 

TURKMENISTAN 

558 

TURQUIA 

522 

TUVALU 

419 

U.R.S.S. Â Â \(NO 

521 

U.S.A. 

225 

UCRANIA 

559 

UGANDA 

136 

URUGUAY 

223 

UZBEKISTAN 

560 

VANUATU 

415 

VENEZUELA 

201 

VIENDA 

158 

VIETNAM 

325 

YEMEN 

322 

YEMEN DEL SUR 

323 

YUGOESLAVIA \(NO 

526 

ZAMBIA 

117 

ZF.ARICA-ZF IND 

910 

ZF.IQUIQUE 

905 

ZF.PARENAS 

907 

ZIMBABWE 

116 





**Elaborado por: **

**Revisado por: **

****

**Página 43 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** **Anexo: Tabla de monedas **

**Nombre **

**Código **

PESO ARGENTINO 

1 

BOLIVIANO 

2 

CRUZEIRO REAL 

3 

DOLAR CAN 

4 

DOLAR USA 

5 

GUARANI 

6 

NUEVO SOL 

7 

PESO URUG 

8 

MARCO AL 

9 

DOLAR AUST 

10 

CHELIN 

11 

FRANCO BEL 

12 

RENMINBI 

13 

CORONA DIN 

14 

PESETA 

15 

MARCO FIN 

16 

FRANCO FR 

17 

FLORIN 

18 

LIRA 

19 

YEN 

20 

FRANCO SZ 

21 

CORONA NOR 

22 

DOLAR NZ 

23 

LIBRA EST 

24 

CORONA SC 

25 

DOLAR HK 

26 

RAND 

27 

PESO COL 

28 

**Elaborado por: **

**Revisado por: **

****

**Página 44 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **





**Documentación API SOAP **

****

**Versión 34 - Fecha: 07/08/2023 **

**Nivel de acceso de esta información: Restringido** SUCRE 

29 

DRACMA 

30 

PESO MEX 

31 

ESCUDO 

32 

BOLIVAR 

33 

DOLAR SIN 

34 

RUPIA 

35 

DOLAR TAI 

36 

DIRHAM 

37 

EURO 

38 

PESO CHILENO 

39 

OTRAS MONEDAS 

40 

UNIDAD DE FOMENTO CL \(no aplica docs exportación\) 

41 

UNIDAD TRIBUTARIA MENSUAL \(no aplica docs exportación\) 42 



****





****

**Elaborado por: **

**Revisado por: **

****

**Página 45 de 45 **

**Aprobado por: **

****

****

www.FACTO.cl** **



