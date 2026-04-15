import { IDatePickerStrings } from "@fluentui/react";

// Grupos de Seguridad
export const grupoDireccionBoveda = "Dirección de Bóveda";
export const grupoGerenteSucursal = "Gerente de Sucursal";
export const grupoGerenteConstruccion = "Gerente de Construcción";
export const grupoJuridicoInmuebles = "Jurídico de Inmuebles";
export const grupoJuridicoAdministrativo = "Jurídico Administrativo";
export const grupoDireccionArea = "Dirección de Área";
export const grupoAdministradorBoveda = "Administrador Bóveda";
export const grupoRegionalZona = "Regional Zona";

// Listas
export const bibliotecaBoveda = "Boveda";
export const listaConfiguracionRecurrencia = "ConfiguracionRecurrencia";
export const listaControlContadores = "ContadorConsecutivos";
export const listaEstatusRevisionDocumento = "EstatusRevisionDocumento";
export const listaEstatusSolicitud = "EstatusSolicitud";
export const listaHistorialSolicitudes = "HistorialSolicitudes";
export const listaNotificaciones = "Notificaciones";
export const listaNotificacionesVencimiento = "NotificacionesVencimiento";
export const listaRoles = "Roles";
export const listaSolicitudes = "Solicitudes";
export const listaSolicitudesDocumentos = "SolicitudesDocumentos";
export const listaTiposDocumento = "TiposDocumento";
export const listaTiposNotificaciones = "TiposNotificaciones";
export const listaTiposSolicitud = "TiposSolicitud";
export const listaTiposTramite = "TiposTramite";
export const listaGerentesSucursales = "GerentesSucursales";
export const listaCiudades = "Ciudades";
export const listaEstados = "Estados";
export const listaSucursales = "Sucursales";
export const listaPlantillasNotificaciones = "PlantillasNotificaciones";
export const listaTiposDocumentoSolicitudes = "TiposDocumentoSolicitudes";
export const listaPlantillaNotificaciones = "PlantillasNotificaciones";
export const listaTiposDocumentoRol = "TiposDocumentoRol";
export const listaCondicionesDocumento = "CondicionesDocumento";
export const listaControlEliminacionDocumentos = "ControlEliminacionDocumentos";
export const listaFlujoEstatusSolicitudes = "FlujoEstatusSolicitudes";
export const listaAprobadores = "Aprobadores";
export const listaAsuetos = "Asuetos";

//Generales
export const sitioDatosMaestros = "DatosMaestrosAdminDoc";
export const prefijoFolios = "B";

export const comparadorBoleano = {
  verdadero: 1,
  falso: 0,
};

export const cadenasEspanol: IDatePickerStrings = {
  months: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],

  shortMonths: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ],

  days: [
    "Domingo",
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes",
    "Sabado",
  ],

  shortDays: ["D", "L", "M", "M", "J", "V", "S"],

  goToToday: "Ir a fecha actual",
  prevMonthAriaLabel: "Ir al mes anterior",
  nextMonthAriaLabel: "Ir al mes siguiente",
  prevYearAriaLabel: "Ir al año anterior",
  nextYearAriaLabel: "Ir al año siguiente",
  isRequiredErrorMessage: "Este campo es requerido",
};

export const EstatusSolicitudes = {
  Pendiente: { titulo: "Pendiente", id: 1 },
  Revision: { titulo: "En Revisión", id: 2 },
  Aprobada: { titulo: "Aprobada", id: 3 },
  Rechazada: { titulo: "Rechazada", id: 4 },
  Finalizada: { titulo: "Finalizada", id: 5 },
  RevisionArea: { titulo: "En Revision Área", id: 6 },
  RechazadaArea: { titulo: "Rechazada Área", id: 7 },
  RevisionDireccion: { titulo: "En Revisión Dirección Bóveda", id: 8 },
  RechazadaDireccion: { titulo: "Rechazada Dirección Bóveda", id: 9 }
};

export const TiposSolicitud = {
  Resguardo: { id: 1, titulo: "Resguardo" },
  Prestamo: { id: 2, titulo: "Préstamo" },
  Renovacion: { id: 3, titulo: "Renovación" },
};

export const Roles = {
  DireccionBoveda: { id: 1, titulo: "Dirección de Bóveda" },
  GerenteSucursal: { id: 2, titulo: "Gerente de Sucursal" },
  GerenteConstruccion: { id: 3, titulo: "Gerente de Construcción" },
  JuridicoInmuebles: { id: 4, titulo: "Jurídico de Inmuebles" },
  JuridicoAdministrativo: { id: 5, titulo: "Jurídico Administrativo" },
  DireccionArea: { id: 6, titulo: "Dirección de Área" },
  AdministradorBoveda: { id: 7, titulo: "Administrador Bóveda" },
  RegionalZona: { id: 8, titulo: "Regional Zona" },
};

export enum TiposNotificacion {
  NuevaSolicitudResguardo = 1,
  VencimientoDocumentos = 2,
  SolicitudRevisionBoveda = 3,
  SolicitudAprobadaBoveda = 4,
  SolicitudRechazadaBoveda = 5,
  NuevaSolicitudPrestamoDireccionArea = 6,
  NuevaSolicitudPrestamoDireccionBoveda = 7,
  SolicitudPrestamoAprobada = 8,
  SolicitudPrestamoRechazada = 9,
  SolicitudPrestamoFinalizada = 10,
  SolicitudFinalizada = 11
}

export const TiposMovimientoHistorial = {
  CreacionSolicitudResguardo: "Creación de solicitud de resguardo",
  CreacionSolicitudRenovacion: "Creación de solicitud de renovación",
  CreacionSolicitudPrestamo: "Creación de solicitud de préstamo",
  EnvioSolicitudRevisionBoveda: "Envio de solicitud a Revisión Bóveda",
  AprobacionAdministradorBoveda: "Aprobación de solicitud por Administrador Bóveda",
  RechazoAdministradorBoveda: "Rechazo de solicitud por Administrador Bóveda",
  FinalizacionSolicitud: "Finalización de solicitud por Administrador Bóveda",
  AprobacionArea:"Aprobación de solicitud por el director de área",
  RechazoArea:"Rechazo de solicitud por el director de área",
  AprobacionDireccionBoveda:"Aprobación de solicitud por el director de bóveda",
  RechazoDireccionBoveda:"Rechazo de solicitud por el director de bóveda",
  EnvioSolicitudArea:"Envío de solicitud a dirección de área",
  EnvioSolicitudDireccion:"Envío de solicitud a dirección de bóveda"
};

export const EstatusRevisionDocumento = {
  Aprobado: { id: 1, titulo: "Aprobado" },
  Rechazado: { id: 2, titulo: "Rechazado" },
};
