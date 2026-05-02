const express = require('express');
const router = express.Router();

const CON_USUARIORoute = require('./CON_USUARIO');
 router.use('/con-usuario', CON_USUARIORoute);

const CON_ROLRoute = require('./CON_ROL');
 router.use('/con-rol', CON_ROLRoute);

const CON_USUARIO_ROLRoute = require('./CON_USUARIO_ROL');
 router.use('/con-usuario-rol', CON_USUARIO_ROLRoute);

const CON_MONEDARoute = require('./CON_MONEDA');
 router.use('/con-moneda', CON_MONEDARoute);

const CON_ESTADO_PERIODORoute = require('./CON_ESTADO_PERIODO');
 router.use('/con-estado-periodo', CON_ESTADO_PERIODORoute);

const CON_ESTADO_ASIENTORoute = require('./CON_ESTADO_ASIENTO');
 router.use('/con-estado-asiento', CON_ESTADO_ASIENTORoute);

const CON_TIPO_ASIENTORoute = require('./CON_TIPO_ASIENTO');
 router.use('/con-tipo-asiento', CON_TIPO_ASIENTORoute);

const CON_TIPO_CUENTARoute = require('./CON_TIPO_CUENTA');
 router.use('/con-tipo-cuenta', CON_TIPO_CUENTARoute);

const CON_CENTRO_COSTORoute = require('./CON_CENTRO_COSTO');
 router.use('/con-centro-costo', CON_CENTRO_COSTORoute);

const CON_CUENTARoute = require('./CON_CUENTA');
 router.use('/con-cuenta', CON_CUENTARoute);

const CON_TIPO_CAMBIORoute = require('./CON_TIPO_CAMBIO');
 router.use('/con-tipo-cambio', CON_TIPO_CAMBIORoute);

const CON_PERIODORoute = require('./CON_PERIODO');
 router.use('/con-periodo', CON_PERIODORoute);

const CON_IMPUESTORoute = require('./CON_IMPUESTO');
 router.use('/con-impuesto', CON_IMPUESTORoute);

const CON_ASIENTORoute = require('./CON_ASIENTO');
 router.use('/con-asiento', CON_ASIENTORoute);

const CON_ASIENTO_DETALLERoute = require('./CON_ASIENTO_DETALLE');
 router.use('/con-asiento-detalle', CON_ASIENTO_DETALLERoute);

const CON_IMPUESTO_MOVIMIENTORoute = require('./CON_IMPUESTO_MOVIMIENTO');
 router.use('/con-impuesto-movimiento', CON_IMPUESTO_MOVIMIENTORoute);

const CON_BITACORARoute = require('./CON_BITACORA');
 router.use('/con-bitacora', CON_BITACORARoute);

 const CON_REPROCESO_PERIODORoute = require('./CON_REPROCESO_PERIODO');
 router.use('/con-reproceso-periodo', CON_REPROCESO_PERIODORoute);
const REPORTE_DIARIORoute = require('./REPORTE_DIARIO');
 router.use('/reportes', REPORTE_DIARIORoute);

const REPORTE_BALANCERoute = require('./REPORTE_BALANCE');
router.use('/reportes', REPORTE_BALANCERoute);

module.exports = router;
