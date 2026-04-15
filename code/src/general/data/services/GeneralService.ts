import { IGeneralService } from "../interfaces/IGeneralService";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { spfi, SPFI, SPFx } from "@pnp/sp";
import { AssignFrom } from "@pnp/core";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";
import { Usuario, Rol } from "../entities";
import {
  grupoAdministradorBoveda,
  grupoGerenteConstruccion,
  grupoGerenteSucursal,
  grupoJuridicoAdministrativo,
  grupoJuridicoInmuebles,
  listaGerentesSucursales,
  sitioDatosMaestros,
  grupoDireccionBoveda,
  grupoDireccionArea,
  grupoRegionalZona,
  Roles,
  listaConfiguracionRecurrencia,
} from "../entities/Constantes";
import { ISiteUserInfo } from "@pnp/sp/site-users/types";

export class GeneralService implements IGeneralService {
  private sp: SPFI;
  private spDM: SPFI;

  constructor(context?: WebPartContext) {
    const urlTenant = context.pageContext.web.absoluteUrl.split("sites")[0];
    this.sp = spfi().using(SPFx(context as any));
    this.spDM = spfi(`${urlTenant}/sites/${sitioDatosMaestros}`).using(
      AssignFrom(this.sp.web)
    );
  }

  public obtenerDatosUsuario(): Promise<Usuario> {
    let user = new Usuario();
    const UserDataRequests: any[] = [];
    UserDataRequests.push(this.obtenerInfoUsuario());
    UserDataRequests.push(this.obtenerGruposUsuario());
    UserDataRequests.push(this.obtenerSucursalUsuario());
    return new Promise((resolve) => {
      Promise.all(UserDataRequests)
        .then((userData) => {
          user = { ...userData[0], ...userData[2] };
          user.Grupos = userData[1];
          user.Rol = this.obtenerRolUsuario(userData[1]);
          resolve(user);
        })
        .catch((error) => {
          resolve(null);
          console.log(`Error obtenerDatosUsuario : ${error}`);
        });
    });
  }

  public obtenerUsuariosGrupoSP(grupo: string): Promise<ISiteUserInfo[]> {
    return new Promise((resolve) => {
      this.sp.web.siteGroups
        .getByName(grupo)
        .users()
        .then((groupUsers) => {
          resolve(groupUsers);
        })
        .catch((error) => {
          resolve(null);
          console.log(`Error obtenerUsuariosGrupoSP : ${error}`);
        });
    });
  }

  private obtenerInfoUsuario(): Promise<Usuario> {
    const user = new Usuario();
    return new Promise((resolve) => {
      this.sp.web
        .currentUser()
        .then((data) => {
          user.Id = data.Id;
          user.Nombre = data.Title;
          user.Email = data.Email;
          resolve(user);
        })
        .catch((error) => {
          console.log(`Error información del usuario: ${error}`);
          resolve(null);
        });
    });
  }

  private obtenerGruposUsuario(): Promise<string[]> {
    return new Promise((resolve) => {
      this.sp.web.currentUser
        .groups()
        .then((items) => {
          const grupoArray: string[] = items.map((item) => {
            return item.Title;
          });
          resolve(grupoArray);
        })
        .catch((error) => {
          console.log(`Error obteniendo grupos del usuario: ${error}`);
        });
    });
  }

  private obtenerSucursalUsuario(): Promise<any> {
    return new Promise((resolve) => {
      this.spDM.web
        .currentUser()
        .then((userDM) => {
          this.spDM.web.lists
            .getByTitle(listaGerentesSucursales)
            .items.select(
              "ID",
              "Usuario/Id",
              "Usuario/Title",
              "Usuario/EMail",
              "Sucursal/Id",
              "Sucursal/Title",
              "DireccionArea/Id",
              "DireccionArea/Title",
              "DireccionArea/EMail"
            )
            .expand("Usuario", "Sucursal","DireccionArea")
            .filter(`Usuario/Id eq ${userDM.Id} and Activo eq 1`)()
            .then((gerenteSucursal) => {
              if(gerenteSucursal.length > 0)
              {
                this.obtenerUsuariosGrupoSP(grupoDireccionArea).then((usuariosDireccionArea)=>{
                const directorArea = usuariosDireccionArea.find(x=>x.Email === gerenteSucursal[0].DireccionArea.EMail);
                const sucursalUsuario: any = {
                  SucursalId: gerenteSucursal[0].Sucursal.Id,
                  SucursalNombre: gerenteSucursal[0].Sucursal.Title,
                  DireccionArea: directorArea ? { 
                    Id: directorArea.Id, 
                    Nombre: directorArea.Title,
                    Email: directorArea.Email
                  } : { 
                    Id: 0, 
                    Nombre: "",
                    Email: ""
                  }
                };
                resolve(sucursalUsuario);
              })
              .catch((error)=>{
                console.log("Error al obtener los usuarios del grupo Dirección de Área. ", error);
                resolve(null);
              })
            }
            else
              resolve(0);
            })
            .catch((error) => {
              console.log(`Error obteniendo sucursal del usuario: ${error}`);
              resolve(null);
            });
        })
        .catch((error) => {
          console.log("Error obtener datos Usuario DM ", error);
          resolve(null);
        });
    });
  }

  private obtenerRolUsuario = (grupos: string[]): Rol => {
    if (
      grupos.indexOf(grupoAdministradorBoveda) > -1 ||
      grupos.indexOf(grupoDireccionBoveda) > -1 ||
      grupos.indexOf(grupoDireccionArea) > -1 ||
      grupos.indexOf(grupoRegionalZona) > -1 ||
      grupos.indexOf(grupoGerenteSucursal) > -1 ||
      grupos.indexOf(grupoGerenteConstruccion) > -1 ||
      grupos.indexOf(grupoJuridicoInmuebles) > -1 ||
      grupos.indexOf(grupoJuridicoAdministrativo) > -1
    ) {
      const rolUsuario = new Rol();
      if (grupos.indexOf(grupoAdministradorBoveda) > -1) {
        rolUsuario.Id = Roles.AdministradorBoveda.id;
        rolUsuario.Title = Roles.AdministradorBoveda.titulo;
      } else if (grupos.indexOf(grupoDireccionBoveda) > -1) {
        rolUsuario.Id = Roles.DireccionBoveda.id;
        rolUsuario.Title = Roles.DireccionBoveda.titulo;
      } else if (grupos.indexOf(grupoDireccionArea) > -1) {
        rolUsuario.Id = Roles.DireccionArea.id;
        rolUsuario.Title = Roles.DireccionArea.titulo;
      } else if (grupos.indexOf(grupoRegionalZona) > -1) {
        rolUsuario.Id = Roles.RegionalZona.id;
        rolUsuario.Title = Roles.RegionalZona.titulo;
      } else if (grupos.indexOf(grupoGerenteSucursal) > -1) {
        rolUsuario.Id = Roles.GerenteSucursal.id;
        rolUsuario.Title = Roles.GerenteSucursal.titulo;
      } else if (grupos.indexOf(grupoGerenteConstruccion) > -1) {
        rolUsuario.Id = Roles.GerenteConstruccion.id;
        rolUsuario.Title = Roles.GerenteConstruccion.titulo;
      } else if (grupos.indexOf(grupoJuridicoInmuebles) > -1) {
        rolUsuario.Id = Roles.JuridicoInmuebles.id;
        rolUsuario.Title = Roles.JuridicoInmuebles.titulo;
      } else if (grupos.indexOf(grupoJuridicoAdministrativo) > -1) {
        rolUsuario.Id = Roles.JuridicoAdministrativo.id;
        rolUsuario.Title = Roles.JuridicoAdministrativo.titulo;
      }
      return rolUsuario;
    }
  };

  public obtenerConfiguracionRecurrencia(): Promise<any> {
    return new Promise((resolve) => {
      this.sp.web.lists
        .getByTitle(listaConfiguracionRecurrencia)
        .items.select(
          "ID",
          "Title",
          "DiasAnticipacion",
          "DiasFrecuencia"
        )
        .orderBy('ID', false)
        .top(1)
        ()
        .then((items) => {
          if (items.length > 0)
            resolve(items[0]);
        })
        .catch((error) => {
          console.log("Error obtenerConfiguracionRecurrencia", error);
          resolve(null);
        });
    });
  }
}
